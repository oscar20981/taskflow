import mongoose from 'mongoose';
import { createClient } from 'redis';
import { config, ESTADOS, REDIS_KEYS } from './config.js';
import { Solicitud } from './models/Solicitud.js';
import { procesarSolicitud } from './rules/procesador.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const log = (...args) => console.log('[worker]', ...args);

const redisOptions = {
  url: config.redisUrl,
  socket: { reconnectStrategy: (retries) => Math.min(retries * 200, 3000) },
};

// Dos conexiones: `blocking` espera la cola (BLPOP bloquea la conexión) y `redis` hace el resto.
const redis = createClient(redisOptions);
const blocking = redis.duplicate();
for (const [name, client] of [['redis', redis], ['redis:bloqueante', blocking]]) {
  client.on('error', (error) => console.error(`[worker] ${name}:`, error.message));
}

const publish = (update) =>
  redis.publish(REDIS_KEYS.updatesChannel, JSON.stringify(update)).catch((error) => console.error('[worker] publish:', error.message));

const connectMongo = async () => {
  for (;;) {
    try {
      await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 3000 });
      return log('MongoDB conectado');
    } catch (error) {
      console.warn(`[worker] MongoDB no disponible (${error.message}). Reintentando en 3s...`);
      await delay(3000);
    }
  }
};

const heartbeat = () =>
  redis.setEx(REDIS_KEYS.workerHeartbeat, config.heartbeatSeconds, new Date().toISOString()).catch(() => {});

/**
 * Tras un reinicio (o si Redis perdió la cola) vuelve a encolar las solicitudes que quedaron
 * sin atender según MongoDB, sin duplicar las que ya están en la cola (HU-04 / prueba de recuperación).
 */
const recuperarPendientes = async () => {
  const enCola = new Set(await redis.lRange(REDIS_KEYS.queue, 0, -1));
  const pendientes = await Solicitud.find({
    estado: { $in: [ESTADOS.PENDIENTE, ESTADOS.EN_COLA, ESTADOS.PROCESANDO] },
  })
    .sort({ fechaCreacion: 1 })
    .select('_id estado')
    .lean();

  let recuperadas = 0;
  for (const { _id, estado } of pendientes) {
    const id = String(_id);
    if (enCola.has(id)) continue;
    if (estado !== ESTADOS.EN_COLA) await Solicitud.updateOne({ _id }, { estado: ESTADOS.EN_COLA });
    await redis.lPush(REDIS_KEYS.queue, id);
    await publish({ id, estado: ESTADOS.EN_COLA });
    recuperadas += 1;
  }
  log(`recuperación: ${recuperadas} solicitud(es) reencolada(s), ${enCola.size} ya estaban en la cola`);
};

/**
 * Flujo del Worker (HU-05):
 * obtener solicitud -> PROCESANDO -> aplicar reglas -> guardar respuesta -> RESPONDIDA | ERROR.
 * Los errores del propio procesamiento marcan la solicitud como ERROR sin detener al Worker.
 */
const procesar = async (id) => {
  const solicitud = await Solicitud.findById(id).lean();
  if (!solicitud) return log(`solicitud ${id} no existe; se descarta`);
  if ([ESTADOS.RESPONDIDA, ESTADOS.ERROR].includes(solicitud.estado)) return log(`solicitud ${id} ya fue atendida; se omite`);

  await Solicitud.updateOne({ _id: id }, { estado: ESTADOS.PROCESANDO });
  await publish({ id, estado: ESTADOS.PROCESANDO });
  log(`procesando ${id} (${solicitud.categoria})`);

  await delay(config.processingDelayMs);

  try {
    const respuesta = procesarSolicitud(solicitud);
    const fechaProcesamiento = new Date();
    await Solicitud.updateOne(
      { _id: id },
      { estado: ESTADOS.RESPONDIDA, respuesta, mensajeError: '', fechaProcesamiento }
    );
    await publish({ id, estado: ESTADOS.RESPONDIDA, respuesta, fechaProcesamiento });
    log(`respondida ${id}`);
  } catch (error) {
    const mensajeError = error.message || 'Error procesando la solicitud';
    const fechaProcesamiento = new Date();
    await Solicitud.updateOne({ _id: id }, { estado: ESTADOS.ERROR, mensajeError, fechaProcesamiento });
    await publish({ id, estado: ESTADOS.ERROR, mensajeError, fechaProcesamiento });
    console.warn(`[worker] solicitud ${id} -> ERROR: ${mensajeError}`);
  }
};

const main = async () => {
  await connectMongo();
  await Promise.all([redis.connect(), blocking.connect()]);
  log('Redis conectado; esperando solicitudes en la cola');

  await heartbeat();
  setInterval(heartbeat, config.heartbeatEveryMs);
  await recuperarPendientes();

  for (;;) {
    let id = null;
    try {
      const item = await blocking.blPop(REDIS_KEYS.queue, 5);
      if (!item) continue;
      id = String(item.element ?? item[1]);

      if (!mongoose.isValidObjectId(id)) {
        log(`identificador inválido en la cola (${id}); se descarta`);
        continue;
      }
      await procesar(id);
    } catch (error) {
      // Falla de infraestructura (MongoDB/Redis): se devuelve la solicitud a la cola y se reintenta.
      console.error('[worker] error de infraestructura:', error.message);
      if (id && mongoose.isValidObjectId(id)) await redis.rPush(REDIS_KEYS.queue, id).catch(() => {});
      await delay(2000);
    }
  }
};

const shutdown = async () => {
  log('deteniendo...');
  await Promise.allSettled([redis.quit(), blocking.disconnect(), mongoose.disconnect()]);
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

main();

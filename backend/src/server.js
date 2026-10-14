import { createServer } from 'http';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { config } from './config/index.js';
import { connectMongo } from './config/database.js';
import { connectRedis, disconnectRedis } from './services/redis.service.js';
import { invalidateCache } from './services/cache.service.js';
import { queueLength } from './services/queue.service.js';
import { getMonitor } from './services/monitor.service.js';
import { emit, initSocket } from './sockets/index.js';

const httpServer = createServer(createApp());
initSocket(httpServer);

const EVENTO_POR_ESTADO = {
  EN_COLA: 'solicitud-encolada',
  PROCESANDO: 'solicitud-procesando',
  RESPONDIDA: 'solicitud-respondida',
  ERROR: 'solicitud-error',
};

// El Worker publica cada cambio de estado en Redis; el backend lo reenvía al navegador por Socket.IO.
const onWorkerUpdate = async (update) => {
  await invalidateCache();
  emit(EVENTO_POR_ESTADO[update.estado] || 'solicitud-actualizada', update);
  emit('cola-actualizada', { queueLength: await queueLength() });
  emit('monitor-actualizado', await getMonitor());
};

// El servidor abre el puerto de inmediato; las dependencias se conectan (y reintentan) en segundo plano.
httpServer.listen(config.port, config.host, () => {
  console.log(`[backend] escuchando en http://${config.host}:${config.port}`);
});

connectMongo();
connectRedis(onWorkerUpdate).catch((error) => console.error('[redis] fallo al iniciar:', error.message));

const shutdown = async () => {
  httpServer.close();
  await Promise.allSettled([mongoose.disconnect(), disconnectRedis()]);
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

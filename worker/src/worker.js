import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createClient } from 'redis';

dotenv.config();

const REDIS_URL = process.env.WORKER_REDIS_URL || 'redis://localhost:6379';
const MONGO_URI = process.env.WORKER_MONGO_URI || 'mongodb://localhost:27017/taskflow';

const requestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    priority: { type: String, required: true },
    status: { type: String, default: 'PENDIENTE' },
    response: { type: String, default: '' },
    error: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    processedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const Request = mongoose.models.Request || mongoose.model('Request', requestSchema);

const categories = {
  Informacion: 'Gracias por tu solicitud de información. Te responderemos con la información requerida.',
  Soporte: 'Hemos registrado tu caso de soporte y estamos revisando la incidencia.',
  Documento: 'Tu solicitud de documento ha sido recibida y será gestionada en breve.',
  Consulta: 'Consulta recibida. Revisaremos el estado de tu proceso.',
  Actualizacion: 'Solicitud de actualización recibida. Verificaremos la información.',
};

const getResponse = (category) => categories[category] || 'Gracias por tu mensaje. Hemos recibido tu solicitud y la revisaremos.';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const startWorker = async () => {
  let mongoReady = false;

  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    mongoReady = true;
    console.log('Worker: Mongo conectado');
  } catch (error) {
    console.warn('Worker: Mongo no disponible. Usando almacenamiento local.');
  }

  let redisClient = null;
  let redisPublisher = null;

  const publishUpdate = async (update) => {
    if (redisPublisher?.isOpen) {
      await redisPublisher.publish('taskflow:updates', JSON.stringify(update));
    }
  };

  const connectRedis = async () => {
    try {
      redisClient = createClient({
        url: REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 200, 2000),
          connectTimeout: 5000,
        },
      });

      redisClient.on('error', (err) => {
        console.error('Worker redis error:', err.message || err);
      });

      redisClient.on('end', () => {
        console.warn('Worker: Redis desconectado. Intentando reconectar...');
      });

      await redisClient.connect();
      redisPublisher = redisClient.duplicate();
      redisPublisher.on('error', (err) => console.error('Worker Redis publisher error:', err.message || err));
      await redisPublisher.connect();
      console.log('Worker: Redis conectado');
      return true;
    } catch (error) {
      console.warn('Worker: Redis no disponible. Reintentando en 3s...');
      return false;
    }
  };

  const localQueue = [];

  const recoverPendingRequests = async () => {
    if (!mongoReady || !redisClient?.isOpen) return;

    const queueLength = await redisClient.lLen('taskflow:queue');
    if (queueLength > 0) return;

    const pendingRequests = await Request.find({
      status: { $in: ['PENDIENTE', 'EN_COLA', 'PROCESANDO'] },
      processedAt: null,
    }).lean();

    for (const request of pendingRequests) {
      await redisClient.lPush('taskflow:queue', JSON.stringify(request));
    }

    if (pendingRequests.length > 0) {
      console.log(`Worker: ${pendingRequests.length} solicitud(es) recuperada(s) desde Mongo`);
    }
  };

  while (true) {
    if (!redisClient || !redisClient.isOpen) {
      const connected = await connectRedis();
      if (!connected) {
        await delay(3000);
        continue;
      }

      try {
        await recoverPendingRequests();
      } catch (error) {
        console.error('Worker recovery error:', error.message || error);
      }
    }

    let requestId = null;

    try {
      let item = null;

      if (redisClient?.isOpen) {
        item = await redisClient.blPop('taskflow:queue', 5);
      } else {
        await delay(1000);
        if (localQueue.length === 0) continue;
        item = { element: localQueue.shift() };
      }

      const queueItem = Array.isArray(item) ? { element: item[1] } : item;
      if (!queueItem || !queueItem.element) continue;

      const payload = typeof queueItem.element === 'string' ? JSON.parse(queueItem.element) : queueItem.element;
      requestId = payload._id || payload.id;
      console.log('Worker procesando:', payload);

      if (mongoReady) {
        await Request.findByIdAndUpdate(requestId, {
          status: 'PROCESANDO',
        });
      }
      await publishUpdate({ id: requestId, status: 'PROCESANDO' });

      await delay(2000);

      const responseText = getResponse(payload.category);
      const result = {
        _id: requestId,
        id: requestId,
        title: payload.title,
        description: payload.description,
        category: payload.category,
        priority: payload.priority,
        status: 'RESPONDIDA',
        response: responseText,
        processedAt: new Date().toISOString(),
        createdAt: payload.createdAt || new Date().toISOString(),
      };

      if (mongoReady) {
        await Request.findByIdAndUpdate(requestId, {
          status: 'RESPONDIDA',
          response: responseText,
          processedAt: new Date(),
        });
      }
      await publishUpdate({
        id: requestId,
        status: 'RESPONDIDA',
        response: responseText,
        processedAt: result.processedAt,
      });

      console.log('Respuesta generada:', result);
    } catch (error) {
      console.error('Worker runtime error:', error.message || error);
      if (mongoReady && requestId) {
        await Request.findByIdAndUpdate(requestId, {
          status: 'ERROR',
          error: error.message || 'Error procesando la solicitud',
          processedAt: new Date(),
        });
        await publishUpdate({
          id: requestId,
          status: 'ERROR',
          error: error.message || 'Error procesando la solicitud',
        });
      }
      if (redisClient && redisClient.isOpen) {
        await redisClient.disconnect();
      }
      await delay(2000);
    }
  }
};

startWorker();

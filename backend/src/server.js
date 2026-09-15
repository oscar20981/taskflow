import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import { createClient } from 'redis';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/taskflow';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const REQUESTS_CACHE_KEY = 'taskflow:cache:requests';
const REQUESTS_CACHE_TTL = 5;

const memoryStore = [];
const memoryQueue = [];
let redisClient = null;
let redisSubscriber = null;
let mongoReady = false;

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

const emitSocket = (event, payload) => {
  io.emit(event, payload);
};

const readRequests = async () => {
  if (mongoReady) {
    if (redisClient?.isOpen) {
      try {
        const cachedRequests = await redisClient.get(REQUESTS_CACHE_KEY);
        if (cachedRequests) return JSON.parse(cachedRequests);
      } catch (error) {
        console.error('Redis cache read error:', error.message);
      }
    }

    const requests = await Request.find().sort({ createdAt: -1 }).lean();

    if (redisClient?.isOpen) {
      try {
        await redisClient.setEx(REQUESTS_CACHE_KEY, REQUESTS_CACHE_TTL, JSON.stringify(requests));
      } catch (error) {
        console.error('Redis cache write error:', error.message);
      }
    }

    return requests;
  }

  return [...memoryStore].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const invalidateRequestsCache = async () => {
  if (!redisClient?.isOpen) return;

  try {
    await redisClient.del(REQUESTS_CACHE_KEY);
  } catch (error) {
    console.error('Redis cache invalidation error:', error.message);
  }
};

const saveRequestLocally = async (request) => {
  if (mongoReady) {
    const doc = await Request.create(request);
    return doc.toObject();
  }

  memoryStore.unshift(request);
  return request;
};

const findRequestById = async (id) => {
  if (mongoReady) {
    return await Request.findById(id).lean();
  }

  return memoryStore.find((item) => String(item._id || item.id) === String(id));
};

const updateRequest = async (id, updates) => {
  if (mongoReady) {
    return await Request.findByIdAndUpdate(id, updates, { new: true }).lean();
  }

  const item = memoryStore.find((entry) => String(entry._id || entry.id) === String(id));
  if (!item) return null;
  Object.assign(item, updates);
  return item;
};

const enqueueRequest = async (request) => {
  const payload = JSON.stringify(request);

  if (redisClient) {
    await redisClient.lPush('taskflow:queue', payload);
    return;
  }

  memoryQueue.push(payload);
};

const startRedis = async () => {
  try {
    redisClient = createClient({ url: REDIS_URL });
    redisClient.on('error', (err) => console.error('Redis error:', err.message));
    await redisClient.connect();

    redisSubscriber = redisClient.duplicate();
    redisSubscriber.on('error', (err) => console.error('Redis subscriber error:', err.message));
    await redisSubscriber.connect();
    await redisSubscriber.subscribe('taskflow:updates', async (message) => {
      try {
        const update = JSON.parse(message);
        await invalidateRequestsCache();
        emitSocket('solicitud-actualizada', update);
        emitSocket('cola-actualizada', { queueLength: await getQueueLength() });
      } catch (error) {
        console.error('Redis update message error:', error.message);
      }
    });

    console.log('Redis conectado');
  } catch (error) {
    console.warn('Redis no disponible. Usando cola local.');
    redisClient = null;
    redisSubscriber = null;
  }
};

const getQueueLength = async () => {
  if (!redisClient?.isOpen) return memoryQueue.length;

  try {
    return await redisClient.lLen('taskflow:queue');
  } catch (error) {
    console.error('Redis queue error:', error.message);
    return 0;
  }
};

const startMongo = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    mongoReady = true;
    console.log('Mongo conectado');
  } catch (error) {
    console.warn('Mongo no disponible. Usando almacenamiento local.');
    mongoReady = false;
  }
};

const buildStats = (items) => {
  const summary = {
    total: items.length,
    pending: items.filter((item) => item.status === 'PENDIENTE').length,
    queue: items.filter((item) => item.status === 'EN_COLA').length,
    processing: items.filter((item) => item.status === 'PROCESANDO').length,
    responded: items.filter((item) => item.status === 'RESPONDIDA').length,
    error: items.filter((item) => item.status === 'ERROR').length,
  };

  return summary;
};

app.use(helmet());
app.use(cors({ origin: FRONTEND_URL }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
}));
app.use(express.json());

app.get('/api/health', async (req, res) => {
  const items = await readRequests();
  const queueLength = await getQueueLength();
  const healthy = mongoReady && Boolean(redisClient?.isOpen);

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    service: 'backend',
    mongo: mongoReady,
    redis: Boolean(redisClient?.isOpen),
    queueLength,
    stats: buildStats(items),
  });
});

app.get('/api/solicitudes', async (req, res) => {
  try {
    const items = await readRequests();
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/monitor', async (req, res) => {
  try {
    const items = await readRequests();
    res.json({ success: true, data: buildStats(items) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/solicitudes', async (req, res) => {
  const title = String(req.body.title || '').trim();
  const description = String(req.body.description || '').trim();
  const category = String(req.body.category || '').trim();
  const priority = String(req.body.priority || '').trim();

  if (!title || !description || !category || !priority || title.length > 120 || description.length > 2000) {
    return res.status(400).json({
      success: false,
      message: 'Campos obligatorios inválidos o demasiado largos',
    });
  }

  try {
    const newRequest = {
      _id: new mongoose.Types.ObjectId().toString(),
      title,
      description,
      category,
      priority,
      status: 'PENDIENTE',
      response: '',
      error: '',
      createdAt: new Date().toISOString(),
      processedAt: null,
    };

    const savedRequest = await saveRequestLocally(newRequest);
    await enqueueRequest({ ...savedRequest, status: 'EN_COLA' });
    const queuedRequest = mongoReady
      ? await Request.findOneAndUpdate(
          { _id: savedRequest._id, status: 'PENDIENTE' },
          { status: 'EN_COLA' },
          { new: true }
        ).lean()
      : savedRequest;
    const currentRequest = queuedRequest || (mongoReady ? await Request.findById(savedRequest._id).lean() : savedRequest);
    await invalidateRequestsCache();

    emitSocket('solicitud-creada', currentRequest);
    emitSocket('cola-actualizada', { queueLength: await getQueueLength() });

    res.status(201).json({
      success: true,
      message: 'Solicitud registrada correctamente',
      data: currentRequest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/solicitudes/:id', async (req, res) => {
  try {
    const request = await findRequestById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

io.on('connection', (socket) => {
  console.log('Cliente Socket.IO conectado');
  socket.on('ping', () => {
    socket.emit('pong', { ok: true });
  });
});

const start = async () => {
  await startMongo();
  await startRedis();

  httpServer.listen(PORT, HOST, () => {
    console.log(`Backend escuchando en http://${HOST}:${PORT}`);
  });
};

start();

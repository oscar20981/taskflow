import dotenv from 'dotenv';

dotenv.config();

export const config = {
  mongoUri: process.env.WORKER_MONGO_URI || 'mongodb://localhost:27017/taskflow',
  redisUrl: process.env.WORKER_REDIS_URL || 'redis://localhost:6379',
  // Pausa que simula el trabajo de procesamiento; permite ver el estado PROCESANDO en la demo.
  processingDelayMs: Number(process.env.WORKER_PROCESSING_DELAY_MS) || 2000,
  heartbeatSeconds: 15,
  heartbeatEveryMs: 5000,
};

// Claves compartidas con el backend.
export const REDIS_KEYS = {
  queue: 'taskflow:queue',
  updatesChannel: 'taskflow:updates',
  workerHeartbeat: 'taskflow:worker:heartbeat',
};

export const ESTADOS = {
  PENDIENTE: 'PENDIENTE',
  EN_COLA: 'EN_COLA',
  PROCESANDO: 'PROCESANDO',
  RESPONDIDA: 'RESPONDIDA',
  ERROR: 'ERROR',
};

import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 4000,
  host: process.env.HOST || '0.0.0.0',
  // Uno o varios orígenes permitidos, separados por coma.
  frontendOrigins: (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map((o) => o.trim()),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/taskflow',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  // Tiempo de vida (segundos) de la información guardada en caché (HU-08).
  cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS) || 30,
};

// Claves y canales de Redis compartidos con el Worker.
export const REDIS_KEYS = {
  queue: 'taskflow:queue',
  updatesChannel: 'taskflow:updates',
  workerHeartbeat: 'taskflow:worker:heartbeat',
  cachePrefix: 'taskflow:cache:',
};

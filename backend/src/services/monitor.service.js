import { isMongoReady } from '../config/database.js';
import { isRedisReady } from './redis.service.js';
import { isWorkerOnline, queueLength } from './queue.service.js';
import { estadisticas } from './solicitud.service.js';

const EMPTY_STATS = { total: 0, pendientes: 0, enCola: 0, procesando: 0, respondidas: 0, errores: 0 };

// Instantánea del sistema para el Monitor (HU-09) y para el evento `monitor-actualizado`.
export const getMonitor = async () => {
  const mongo = isMongoReady();
  const redis = isRedisReady();
  const stats = mongo ? (await estadisticas()).value : EMPTY_STATS;

  return {
    backend: true,
    mongo,
    redis,
    worker: await isWorkerOnline(),
    queueLength: await queueLength(),
    stats,
  };
};

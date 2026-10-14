import { REDIS_KEYS } from '../config/index.js';
import { getRedis, isRedisReady } from './redis.service.js';

// La cola guarda solo el identificador de la solicitud; el Worker consulta los datos en MongoDB.
export const enqueue = async (id) => getRedis().lPush(REDIS_KEYS.queue, String(id));

export const queueLength = async () => {
  if (!isRedisReady()) return 0;
  try {
    return await getRedis().lLen(REDIS_KEYS.queue);
  } catch {
    return 0;
  }
};

// El Worker renueva una clave con TTL corto; si desaparece, se considera detenido.
export const isWorkerOnline = async () => {
  if (!isRedisReady()) return false;
  try {
    return (await getRedis().exists(REDIS_KEYS.workerHeartbeat)) === 1;
  } catch {
    return false;
  }
};

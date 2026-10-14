import { config, REDIS_KEYS } from '../config/index.js';
import { getRedis, isRedisReady } from './redis.service.js';

/**
 * Patrón cache-aside (HU-08):
 *  1. Busca en Redis -> CACHE HIT: devuelve el dato sin tocar MongoDB.
 *  2. Si no existe -> CACHE MISS: consulta MongoDB, lo guarda en Redis con TTL y lo devuelve.
 * Si Redis no responde, consulta directamente MongoDB (BYPASS) para no interrumpir el servicio.
 */
export const remember = async (key, loader, ttl = config.cacheTtlSeconds) => {
  const fullKey = `${REDIS_KEYS.cachePrefix}${key}`;

  if (!isRedisReady()) return { value: await loader(), cache: 'BYPASS' };
  const redis = getRedis();

  try {
    const cached = await redis.get(fullKey);
    if (cached !== null) {
      console.log(`[cache] CACHE HIT  ${key} -> respuesta desde Redis`);
      return { value: JSON.parse(cached), cache: 'HIT' };
    }
  } catch (error) {
    console.error('[cache] error de lectura:', error.message);
  }

  console.log(`[cache] CACHE MISS ${key} -> consultando MongoDB`);
  const value = await loader();

  try {
    await redis.setEx(fullKey, ttl, JSON.stringify(value));
    console.log(`[cache] guardado en Redis ${key} (TTL ${ttl}s)`);
  } catch (error) {
    console.error('[cache] error de escritura:', error.message);
  }

  return { value, cache: 'MISS' };
};

// Cualquier cambio en los datos invalida la caché para mantenerla consistente con MongoDB.
export const invalidateCache = async () => {
  if (!isRedisReady()) return;
  try {
    const redis = getRedis();
    for await (const key of redis.scanIterator({ MATCH: `${REDIS_KEYS.cachePrefix}*`, COUNT: 100 })) {
      await redis.del(key);
    }
  } catch (error) {
    console.error('[cache] error al invalidar:', error.message);
  }
};

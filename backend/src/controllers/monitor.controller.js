import { isMongoReady } from '../config/database.js';
import { isRedisReady } from '../services/redis.service.js';
import { getMonitor } from '../services/monitor.service.js';
import { estadisticas } from '../services/solicitud.service.js';

// Healthcheck de Docker: 200 solo si MongoDB y Redis están disponibles.
export const health = (req, res) => {
  const mongo = isMongoReady();
  const redis = isRedisReady();
  const ok = mongo && redis;
  res.status(ok ? 200 : 503).json({ status: ok ? 'ok' : 'degraded', service: 'backend', mongo, redis });
};

export const monitor = async (req, res) => {
  res.json({ success: true, data: await getMonitor() });
};

export const stats = async (req, res) => {
  const { value, cache } = await estadisticas();
  res.set('X-Cache', cache);
  res.json({ success: true, data: value, meta: { cache } });
};

import { isMongoReady } from '../config/database.js';
import { isRedisReady } from '../services/redis.service.js';
import { HttpError } from './errors.js';

// Sin MongoDB o Redis no se aceptan operaciones: nunca se guarda "a medias" ni en memoria.
export const requireDependencies = (req, res, next) => {
  if (!isMongoReady() || !isRedisReady()) {
    return next(new HttpError(503, 'El servicio no está disponible temporalmente. Intenta en unos segundos.'));
  }
  return next();
};

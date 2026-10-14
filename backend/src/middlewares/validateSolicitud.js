import { validarSolicitud } from '../utils/validators.js';
import { HttpError } from './errors.js';

export const validateSolicitud = ({ parcial = false } = {}) => (req, res, next) => {
  const { errores, datos } = validarSolicitud(req.body, { parcial });
  if (errores.length > 0) return next(new HttpError(400, errores[0], errores));
  req.datos = datos;
  return next();
};

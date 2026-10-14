export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const notFound = (req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
};

// El usuario nunca recibe mensajes técnicos: el detalle solo se escribe en el log.
export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error instanceof HttpError) {
    return res.status(error.status).json({ success: false, message: error.message, errores: error.details });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'El cuerpo de la petición no es un JSON válido' });
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: 'Datos inválidos' });
  }

  console.error('[error]', error);
  return res.status(500).json({ success: false, message: 'Ocurrió un error interno. Intenta nuevamente.' });
};

import * as solicitudes from '../services/solicitud.service.js';
import { queueLength } from '../services/queue.service.js';
import { emit } from '../sockets/index.js';

export const crear = async (req, res) => {
  const { creada, actual } = await solicitudes.crear(req.datos);

  emit('solicitud-creada', creada);
  emit('solicitud-encolada', actual);
  emit('cola-actualizada', { queueLength: await queueLength() });

  res.status(201).json({ success: true, message: 'Solicitud registrada correctamente', data: actual });
};

export const listar = async (req, res) => {
  const { value, cache } = await solicitudes.listar(req.query);
  res.set('X-Cache', cache);
  res.json({ success: true, data: value, meta: { cache, total: value.length } });
};

export const obtener = async (req, res) => {
  res.json({ success: true, data: await solicitudes.obtener(req.params.id) });
};

export const obtenerRespuesta = async (req, res) => {
  res.json({ success: true, data: await solicitudes.obtenerRespuesta(req.params.id) });
};

export const actualizar = async (req, res) => {
  const data = await solicitudes.actualizar(req.params.id, req.datos);
  emit('solicitud-actualizada', data);
  res.json({ success: true, data });
};

export const eliminar = async (req, res) => {
  const data = await solicitudes.eliminar(req.params.id);
  emit('solicitud-eliminada', { id: String(data._id) });
  res.json({ success: true, data });
};

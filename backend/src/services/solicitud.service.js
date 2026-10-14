import mongoose from 'mongoose';
import { ESTADOS } from '../config/constants.js';
import { Solicitud } from '../models/Solicitud.js';
import { HttpError } from '../middlewares/errors.js';
import { invalidateCache, remember } from './cache.service.js';
import { enqueue } from './queue.service.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const assertValidId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, 'Solicitud no encontrada');
};

export const crear = async (datos) => {
  const solicitud = await Solicitud.create({ ...datos, estado: ESTADOS.PENDIENTE });
  const id = String(solicitud._id);

  // Flujo: MongoDB (PENDIENTE) -> estado EN_COLA -> Redis Queue.
  // Se cambia el estado antes de encolar para que el Worker nunca pueda ser "alcanzado" por esta escritura.
  let actual = await Solicitud.findByIdAndUpdate(id, { estado: ESTADOS.EN_COLA }, { new: true }).lean();
  try {
    await enqueue(id);
  } catch (error) {
    // Si Redis falla, queda PENDIENTE y el Worker la recupera al reconectar.
    console.error('[queue] no se pudo encolar:', error.message);
    actual = await Solicitud.findByIdAndUpdate(id, { estado: ESTADOS.PENDIENTE }, { new: true }).lean();
  }

  await invalidateCache();
  return { creada: solicitud.toObject(), actual };
};

export const listar = async ({ search, categoria, prioridad, estado, limit } = {}) => {
  const filtros = {};
  if (categoria) filtros.categoria = String(categoria);
  if (prioridad) filtros.prioridad = String(prioridad);
  if (estado) filtros.estado = String(estado);
  if (search?.trim()) {
    const regex = new RegExp(escapeRegex(search.trim()), 'i');
    filtros.$or = [{ titulo: regex }, { descripcion: regex }, { categoria: regex }];
  }
  const max = Math.min(Math.max(Number(limit) || 200, 1), 500);

  // La clave incluye los filtros: cada combinación de consulta tiene su propia entrada en Redis.
  const cacheKey = `solicitudes:${JSON.stringify({ categoria, prioridad, estado, search: search?.trim() || '', max })}`;
  return remember(cacheKey, () => Solicitud.find(filtros).sort({ fechaCreacion: -1 }).limit(max).lean());
};

export const obtener = async (id) => {
  assertValidId(id);
  const solicitud = await Solicitud.findById(id).lean();
  if (!solicitud) throw new HttpError(404, 'Solicitud no encontrada');
  return solicitud;
};

export const obtenerRespuesta = async (id) => {
  const s = await obtener(id);
  return {
    id: String(s._id),
    estado: s.estado,
    respuesta: s.respuesta,
    mensajeError: s.mensajeError,
    fechaProcesamiento: s.fechaProcesamiento,
  };
};

export const actualizar = async (id, datos) => {
  assertValidId(id);
  const solicitud = await Solicitud.findByIdAndUpdate(id, datos, { new: true, runValidators: true }).lean();
  if (!solicitud) throw new HttpError(404, 'Solicitud no encontrada');
  await invalidateCache();
  return solicitud;
};

export const eliminar = async (id) => {
  assertValidId(id);
  const solicitud = await Solicitud.findByIdAndDelete(id).lean();
  if (!solicitud) throw new HttpError(404, 'Solicitud no encontrada');
  await invalidateCache();
  return solicitud;
};

export const estadisticas = () =>
  remember('estadisticas', async () => {
    const grupos = await Solicitud.aggregate([{ $group: { _id: '$estado', total: { $sum: 1 } } }]);
    const por = Object.fromEntries(grupos.map((g) => [g._id, g.total]));
    const n = (estado) => por[estado] || 0;
    return {
      total: grupos.reduce((acc, g) => acc + g.total, 0),
      pendientes: n(ESTADOS.PENDIENTE),
      enCola: n(ESTADOS.EN_COLA),
      procesando: n(ESTADOS.PROCESANDO),
      respondidas: n(ESTADOS.RESPONDIDA),
      errores: n(ESTADOS.ERROR),
    };
  });

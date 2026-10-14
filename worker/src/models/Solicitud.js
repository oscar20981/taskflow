import mongoose from 'mongoose';
import { ESTADOS } from '../config.js';

// Mismo esquema que el backend (cada servicio se construye con su propio contexto de Docker).
const solicitudSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, required: true, trim: true },
    categoria: { type: String, required: true, trim: true },
    prioridad: { type: String, required: true },
    estado: { type: String, enum: Object.values(ESTADOS), default: ESTADOS.PENDIENTE },
    respuesta: { type: String, default: '' },
    mensajeError: { type: String, default: '' },
    fechaProcesamiento: { type: Date, default: null },
  },
  { timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' }, versionKey: false }
);

export const Solicitud = mongoose.models.Solicitud || mongoose.model('Solicitud', solicitudSchema);

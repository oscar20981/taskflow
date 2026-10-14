import mongoose from 'mongoose';
import { ESTADOS, LIMITES, PRIORIDADES } from '../config/constants.js';

const solicitudSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true, maxlength: LIMITES.titulo },
    descripcion: { type: String, required: true, trim: true, maxlength: LIMITES.descripcion },
    categoria: { type: String, required: true, trim: true, maxlength: LIMITES.categoria },
    prioridad: { type: String, required: true, enum: PRIORIDADES },
    estado: { type: String, enum: Object.values(ESTADOS), default: ESTADOS.PENDIENTE, index: true },
    respuesta: { type: String, default: '' },
    mensajeError: { type: String, default: '' },
    fechaProcesamiento: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' },
    versionKey: false,
  }
);

solicitudSchema.index({ fechaCreacion: -1 });

export const Solicitud = mongoose.models.Solicitud || mongoose.model('Solicitud', solicitudSchema);

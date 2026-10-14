import { LIMITES, PRIORIDADES } from '../config/constants.js';

const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '');

/**
 * Valida y normaliza el cuerpo de una solicitud.
 * - parcial=false: todos los campos son obligatorios (POST).
 * - parcial=true: solo se validan los campos enviados (PUT).
 * Devuelve { errores: string[], datos: object }.
 */
export const validarSolicitud = (body = {}, { parcial = false } = {}) => {
  const errores = [];
  const datos = {};

  const campos = {
    titulo: { etiqueta: 'El título', max: LIMITES.titulo },
    descripcion: { etiqueta: 'La descripción', max: LIMITES.descripcion },
    categoria: { etiqueta: 'La categoría', max: LIMITES.categoria },
  };

  for (const [campo, { etiqueta, max }] of Object.entries(campos)) {
    if (parcial && body[campo] === undefined) continue;
    const valor = texto(body[campo]);
    if (!valor) errores.push(`${etiqueta} es obligatorio.`);
    else if (valor.length > max) errores.push(`${etiqueta} no puede superar ${max} caracteres.`);
    else datos[campo] = valor;
  }

  if (!(parcial && body.prioridad === undefined)) {
    const prioridad = texto(body.prioridad);
    if (!PRIORIDADES.includes(prioridad)) errores.push(`La prioridad debe ser: ${PRIORIDADES.join(', ')}.`);
    else datos.prioridad = prioridad;
  }

  if (parcial && Object.keys(body).length === 0) errores.push('No hay datos para actualizar.');

  return { errores, datos };
};

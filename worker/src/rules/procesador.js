import { generarRespuesta } from './respuestas.js';

export class ErrorControlado extends Error {}

// Marca para demostrar el estado ERROR (HU-11): cualquier título o descripción que incluya [error].
const MARCA_ERROR = /\[error\]/i;

/**
 * Procesa una solicitud y devuelve el texto de la respuesta.
 * Lanza ErrorControlado cuando la solicitud no puede procesarse.
 */
export const procesarSolicitud = (solicitud) => {
  if (MARCA_ERROR.test(`${solicitud.titulo} ${solicitud.descripcion}`)) {
    throw new ErrorControlado('Error simulado: la solicitud contiene la marca [error] y no pudo procesarse.');
  }
  return generarRespuesta(solicitud).respuesta;
};

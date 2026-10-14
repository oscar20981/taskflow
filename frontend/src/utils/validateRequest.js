/**
 * Valida el formulario de "Nueva solicitud" en el cliente, con las mismas
 * reglas que aplica el backend (título y descripción obligatorios y con
 * longitud máxima, categoría y prioridad obligatorias), para poder avisar
 * al usuario antes de enviar la petición a Express.
 * Devuelve los errores por campo para marcarlos visualmente en el formulario.
 */
export const validateRequest = (form) => {
  const fields = {}

  if (!form.titulo?.trim()) fields.titulo = 'El título es obligatorio.'
  else if (form.titulo.trim().length > 120) fields.titulo = 'El título no puede superar 120 caracteres.'

  if (!form.descripcion?.trim()) fields.descripcion = 'La descripción es obligatoria.'
  else if (form.descripcion.trim().length > 2000) fields.descripcion = 'La descripción no puede superar 2000 caracteres.'

  if (!form.categoria?.trim()) fields.categoria = 'Selecciona una categoría.'
  if (!form.prioridad?.trim()) fields.prioridad = 'Selecciona una prioridad.'

  return { valid: Object.keys(fields).length === 0, fields, errors: Object.values(fields) }
}

export default validateRequest

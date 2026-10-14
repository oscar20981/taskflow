// Catálogo único de categorías y prioridades, consumido por el formulario
// de nueva solicitud y por los filtros del listado, para no duplicar estas
// listas en cada vista. "Otra" no tiene regla propia: el Worker intenta deducir
// la categoría y, si no coincide con ninguna, responde con el mensaje genérico.
export const categories = [
  { value: 'Informacion', label: 'Información' },
  { value: 'Soporte', label: 'Soporte' },
  { value: 'Documento', label: 'Documento' },
  { value: 'Consulta', label: 'Consulta' },
  { value: 'Actualizacion', label: 'Actualización' },
  { value: 'Otra', label: 'Otra' },
]

export const priorities = ['Baja', 'Media', 'Alta']

export const categoryLabel = (value) => categories.find((cat) => cat.value === value)?.label || value

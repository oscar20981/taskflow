/** Fecha y hora completas, en formato local (es). */
export const formatDateTime = (value) => {
  if (!value) return 'Pendiente'
  return new Date(value).toLocaleString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Fecha y hora compactas, usadas en tablas y listados. */
export const formatShortDate = (value) => {
  if (!value) return '—'
  return new Date(value).toLocaleString('es', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

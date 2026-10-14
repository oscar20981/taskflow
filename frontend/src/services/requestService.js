import api from '../plugins/axios'

// Toda la comunicación con Express se centraliza aquí (regla de arquitectura n.º 12).

export const getRequests = async (params = {}) => {
  const clean = Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value != null))
  const { data } = await api.get('/solicitudes', { params: clean })
  return { items: data.data || [], cache: data.meta?.cache || '' }
}

export const getRequestById = async (id) => {
  const { data } = await api.get(`/solicitudes/${id}`)
  return data.data
}

export const getRequestResponse = async (id) => {
  const { data } = await api.get(`/solicitudes/${id}/respuesta`)
  return data.data
}

export const createRequest = async (payload) => {
  const { data } = await api.post('/solicitudes', payload)
  return data
}

export const getStats = async () => {
  const { data } = await api.get('/estadisticas')
  return data.data
}

export const getMonitor = async () => {
  const { data } = await api.get('/monitor')
  return data.data
}

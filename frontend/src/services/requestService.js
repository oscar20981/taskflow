import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 10000,
})

export const getRequests = async () => {
  const { data } = await api.get('/solicitudes')
  return data.data || []
}

export const getRequestById = async (id) => {
  const { data } = await api.get(`/solicitudes/${id}`)
  return data.data
}

export const createRequest = async (payload) => {
  const { data } = await api.post('/solicitudes', payload)
  return data
}

export const getMonitoring = async () => {
  const { data } = await api.get('/monitor')
  return data.data
}

export const getHealth = async () => {
  const { data } = await api.get('/health')
  return data
}

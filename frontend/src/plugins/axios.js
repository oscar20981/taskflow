import axios from 'axios'

// Instancia única de Axios para toda la aplicación. La URL base se adapta
// al entorno mediante la variable VITE_API_URL (ver .env.example).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 10000,
})

export default api

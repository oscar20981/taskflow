import { io } from 'socket.io-client'

// Conexión Socket.IO única de la aplicación. Vue nunca habla directamente
// con Redis o MongoDB: este socket solo recibe eventos que el backend
// (Express) emite cuando cambia el estado de una solicitud o de la cola.
const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000', {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'],
})

export default socket

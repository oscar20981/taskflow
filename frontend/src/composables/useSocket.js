import { onMounted, onUnmounted } from 'vue'
import socket from '../plugins/socket'

/**
 * Suscribe un mapa de eventos Socket.IO { evento: manejador } mientras el
 * componente que lo invoca está montado, y retira los listeners al
 * desmontarlo. Centraliza el patrón que antes se repetía en cada vista.
 */
export const useSocket = (eventHandlers = {}) => {
  onMounted(() => {
    Object.entries(eventHandlers).forEach(([event, handler]) => socket.on(event, handler))
  })

  onUnmounted(() => {
    Object.entries(eventHandlers).forEach(([event, handler]) => socket.off(event, handler))
  })

  return { socket }
}

export default useSocket

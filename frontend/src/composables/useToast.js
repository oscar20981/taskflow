import { reactive } from 'vue'

// Estado compartido a nivel de módulo: un único host de notificaciones
// para toda la aplicación (App.vue monta <ToastHost /> una sola vez).
const toasts = reactive([])
let nextId = 1

const remove = (id) => {
  const index = toasts.findIndex((toast) => toast.id === id)
  if (index !== -1) toasts.splice(index, 1)
}

const push = (message, { type = 'success', timeout = 4000 } = {}) => {
  const id = nextId++
  toasts.push({ id, message, type })
  if (timeout) window.setTimeout(() => remove(id), timeout)
  return id
}

export const useToast = () => ({
  toasts,
  success: (message, opts) => push(message, { ...opts, type: 'success' }),
  error: (message, opts) => push(message, { ...opts, type: 'error' }),
  info: (message, opts) => push(message, { ...opts, type: 'info' }),
  dismiss: remove,
})

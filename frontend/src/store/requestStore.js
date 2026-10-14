import { reactive } from 'vue'
import { getMonitor, getStats } from '../services/requestService'

/**
 * Estado global ligero para TaskFlow, implementado con la Composition API
 * en lugar de Pinia (ver arquitectura §3.5: "Pinia u otra solución definida
 * por el equipo"). Centraliza la información que comparten Dashboard y Monitor
 * y los filtros del listado, para no duplicar peticiones ni lógica.
 *
 * Flujo en tiempo real: Socket.IO -> useSocket -> store -> componentes.
 */
const emptyStats = () => ({ total: 0, pendientes: 0, enCola: 0, procesando: 0, respondidas: 0, errores: 0 })

const state = reactive({
  stats: emptyStats(),
  monitor: { backend: false, mongo: false, redis: false, worker: false, queueLength: 0 },
  filters: { search: '', estado: '', categoria: '' },
  loading: false,
  error: '',
})

let statsInFlight = null
let monitorInFlight = null

const refreshStats = () => {
  if (statsInFlight) return statsInFlight
  state.loading = true
  statsInFlight = getStats()
    .then((stats) => {
      state.stats = stats
      state.error = ''
    })
    .catch(() => {
      state.error = 'No se pudieron consultar los indicadores.'
    })
    .finally(() => {
      state.loading = false
      statsInFlight = null
    })
  return statsInFlight
}

const applyMonitor = ({ stats, ...monitor }) => {
  state.monitor = monitor
  if (stats) state.stats = stats
  state.error = ''
}

const refreshMonitor = () => {
  if (monitorInFlight) return monitorInFlight
  state.loading = true
  monitorInFlight = getMonitor()
    .then(applyMonitor)
    .catch(() => {
      state.monitor = { backend: false, mongo: false, redis: false, worker: false, queueLength: 0 }
      state.error = 'No se pudo conectar con el backend.'
    })
    .finally(() => {
      state.loading = false
      monitorInFlight = null
    })
  return monitorInFlight
}

const setFilters = (filters) => {
  Object.assign(state.filters, filters)
}

export const useRequestStore = () => ({ state, refreshStats, refreshMonitor, applyMonitor, setFilters })

export default useRequestStore

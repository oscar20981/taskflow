<template>
  <div>
    <h2>Dashboard</h2>
    <p v-if="loading">Cargando métricas...</p>
    <p v-else-if="error" class="error-message">{{ error }}</p>
    <div v-else class="stats-grid">
      <div class="card">
        <span>Total</span>
        <strong>{{ stats.total }}</strong>
      </div>
      <div class="card">
        <span>Pendientes</span>
        <strong>{{ stats.pending }}</strong>
      </div>
      <div class="card">
        <span>En cola</span>
        <strong>{{ stats.queue }}</strong>
      </div>
      <div class="card">
        <span>Procesando</span>
        <strong>{{ stats.processing }}</strong>
      </div>
      <div class="card">
        <span>Respondidas</span>
        <strong>{{ stats.responded }}</strong>
      </div>
      <div class="card">
        <span>Error</span>
        <strong>{{ stats.error }}</strong>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { getHealth } from '../services/requestService'
import { socket } from '../services/socket'

const stats = ref({
  total: 0,
  pending: 0,
  queue: 0,
  processing: 0,
  responded: 0,
  error: 0,
})
const loading = ref(true)
const error = ref('')
let refreshInterval

const loadStats = async () => {
  try {
    error.value = ''
    stats.value = (await getHealth()).stats
  } catch (requestError) {
    error.value = 'No se pudieron cargar las métricas.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStats()
  const refresh = () => loadStats()
  socket.on('solicitud-creada', refresh)
  socket.on('cola-actualizada', refresh)
  refreshInterval = window.setInterval(loadStats, 10000)
})

onUnmounted(() => {
  socket.off('solicitud-creada')
  socket.off('cola-actualizada')
  window.clearInterval(refreshInterval)
})
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-top: 20px;
}
.card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.card span {
  display: block;
  color: #6b7280;
  margin-bottom: 8px;
}
.card strong {
  font-size: 1.8rem;
}
</style>

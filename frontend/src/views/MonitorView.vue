<template>
  <div>
    <h2>Monitor</h2>
    <p v-if="loading">Comprobando servicios...</p>
    <p v-else-if="error" class="error-message">{{ error }}</p>
    <div v-else class="monitor-panel">
      <p><strong>Backend:</strong> {{ backendStatus }}</p>
      <p><strong>MongoDB:</strong> {{ mongo ? 'Disponible' : 'No disponible' }}</p>
      <p><strong>Redis:</strong> {{ redis ? 'Disponible' : 'No disponible' }}</p>
      <p><strong>Worker:</strong> {{ workerStatus }}</p>
      <p><strong>En cola:</strong> {{ stats.queue }}</p>
      <p><strong>Procesando:</strong> {{ stats.processing }}</p>
      <p><strong>Respondidas:</strong> {{ stats.responded }}</p>
      <p><strong>Errores:</strong> {{ stats.error }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { getHealth } from '../services/requestService'
import { socket } from '../services/socket'

const stats = ref({ queue: 0, processing: 0, responded: 0, error: 0 })
const mongo = ref(false)
const redis = ref(false)
const backendStatus = ref('No disponible')
const workerStatus = ref('No disponible')
const loading = ref(true)
const error = ref('')
let healthInterval

const loadHealth = async () => {
  try {
    error.value = ''
    const data = await getHealth()
    stats.value = data.stats
    mongo.value = data.mongo
    redis.value = data.redis
    backendStatus.value = data.status === 'ok' ? 'Disponible' : 'Degradado'
    workerStatus.value = data.redis ? 'Conectado a la cola' : 'No disponible'
  } catch (requestError) {
    error.value = 'No se pudo consultar el estado de los servicios.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadHealth()
  socket.on('cola-actualizada', loadHealth)
  healthInterval = window.setInterval(loadHealth, 5000)
})

onUnmounted(() => {
  socket.off('cola-actualizada', loadHealth)
  window.clearInterval(healthInterval)
})
</script>

<style scoped>
.monitor-panel {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
</style>

<template>
  <div>
    <h2>Detalle de solicitud</h2>
    <p v-if="loading">Cargando solicitud...</p>
    <p v-else-if="error" class="error-message">{{ error }}</p>
    <div v-else class="detail-card">
      <p><strong>ID:</strong> {{ request._id || request.id }}</p>
      <p><strong>Título:</strong> {{ request.title }}</p>
      <p><strong>Categoría:</strong> {{ request.category }}</p>
      <p><strong>Prioridad:</strong> {{ request.priority }}</p>
      <p><strong>Estado:</strong> {{ request.status }}</p>
      <p><strong>Descripción:</strong> {{ request.description }}</p>
      <p><strong>Respuesta:</strong> {{ request.response || 'Sin respuesta aún' }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getRequestById } from '../services/requestService'

const route = useRoute()
const request = ref({})
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    request.value = await getRequestById(route.params.id)
  } catch (requestError) {
    error.value = requestError.response?.data?.message || 'No se pudo cargar la solicitud.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.detail-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
</style>

<template>
  <div>
    <h2>Solicitudes</h2>
    <p v-if="loading">Cargando solicitudes...</p>
    <p v-else-if="error" class="error-message">{{ error }}</p>
    <p v-else-if="requests.length === 0">No hay solicitudes registradas.</p>
    <table v-else>
      <thead>
        <tr>
          <th>ID</th>
          <th>Título</th>
          <th>Categoría</th>
          <th>Prioridad</th>
          <th>Estado</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in requests" :key="item._id || item.id">
          <td>{{ item._id || item.id }}</td>
          <td>{{ item.title }}</td>
          <td>{{ item.category }}</td>
          <td>{{ item.priority }}</td>
          <td>{{ item.status }}</td>
          <td>
            <router-link :to="`/solicitudes/${item._id || item.id}`">Ver detalle</router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { getRequests } from '../services/requestService'
import { socket } from '../services/socket'

const requests = ref([])
const loading = ref(true)
const error = ref('')

const loadRequests = async () => {
  try {
    error.value = ''
    requests.value = await getRequests()
  } catch (requestError) {
    error.value = 'No se pudieron cargar las solicitudes.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRequests()
  socket.on('solicitud-creada', loadRequests)
})

onUnmounted(() => {
  socket.off('solicitud-creada', loadRequests)
})
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
th, td {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
}
</style>

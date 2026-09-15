<template>
  <div>
    <h2>Nueva solicitud</h2>
    <p v-if="error" class="error-message">{{ error }}</p>
    <form class="request-form" @submit.prevent="submitRequest">
      <label>
        Título
        <input v-model="form.title" type="text" required />
      </label>

      <label>
        Descripción
        <textarea v-model="form.description" required></textarea>
      </label>

      <label>
        Categoría
        <select v-model="form.category" required>
          <option value="Informacion">Información</option>
          <option value="Soporte">Soporte</option>
          <option value="Documento">Documento</option>
          <option value="Consulta">Consulta</option>
          <option value="Actualizacion">Actualización</option>
        </select>
      </label>

      <label>
        Prioridad
        <select v-model="form.priority" required>
          <option value="Baja">Baja</option>
          <option value="Media">Media</option>
          <option value="Alta">Alta</option>
        </select>
      </label>

      <div class="actions">
        <button type="button" class="secondary" @click="resetForm">Cancelar</button>
        <button type="submit" :disabled="submitting">{{ submitting ? 'Enviando...' : 'Enviar' }}</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createRequest } from '../services/requestService'

const router = useRouter()
const submitting = ref(false)
const error = ref('')

const form = reactive({
  title: '',
  description: '',
  category: 'Informacion',
  priority: 'Media',
})

const resetForm = () => {
  form.title = ''
  form.description = ''
  form.category = 'Informacion'
  form.priority = 'Media'
}

const submitRequest = async () => {
  try {
    submitting.value = true
    error.value = ''
    const response = await createRequest(form)
    if (response.success) {
      resetForm()
      router.push('/solicitudes')
    }
  } catch (requestError) {
    error.value = requestError.response?.data?.message || 'No se pudo enviar la solicitud.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.request-form {
  display: grid;
  gap: 16px;
  max-width: 640px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
label {
  display: grid;
  gap: 8px;
  font-weight: 600;
}
input, textarea, select, button {
  font: inherit;
}
input, textarea, select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
button {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
}
button[type='submit'] {
  background: #2563eb;
  color: white;
}
.secondary {
  background: #e5e7eb;
  color: #111827;
}
</style>

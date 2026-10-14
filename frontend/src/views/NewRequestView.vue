<template>
  <div>
    <PageHeader title="Nueva solicitud" description="Registra una solicitud para que entre a la cola de procesamiento." />

    <RequestForm v-model:form="form" :submitting="submitting" @submit="submitRequest" @cancel="resetForm" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createRequest } from '../services/requestService'
import { useToast } from '../composables/useToast'
import PageHeader from '../components/PageHeader.vue'
import RequestForm from '../components/RequestForm.vue'

const router = useRouter()
const toast = useToast()
const submitting = ref(false)

const emptyForm = () => ({
  titulo: '',
  descripcion: '',
  categoria: 'Informacion',
  prioridad: 'Media',
})

const form = ref(emptyForm())

const resetForm = () => {
  form.value = emptyForm()
}

const submitRequest = async () => {
  try {
    submitting.value = true
    const response = await createRequest(form.value)
    if (response.success) {
      toast.success('Solicitud registrada correctamente.')
      resetForm()
      router.push('/solicitudes')
    }
  } catch (requestError) {
    toast.error(requestError.response?.data?.message || 'No se pudo enviar la solicitud.')
  } finally {
    submitting.value = false
  }
}
</script>

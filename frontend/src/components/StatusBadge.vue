<template>
  <span class="status-badge" :data-status="status">{{ label }}</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true },
})

const labels = {
  PENDIENTE: 'Pendiente',
  EN_COLA: 'En cola',
  PROCESANDO: 'Procesando',
  RESPONDIDA: 'Respondida',
  ERROR: 'Error',
}

const label = computed(() => labels[props.status] || props.status)
</script>

<template>
  <section class="response-box" :data-state="state">
    <span>Respuesta</span>
    <p v-if="respuesta">{{ respuesta }}</p>
    <p v-else-if="estado === 'ERROR'">La solicitud no pudo procesarse, por lo que no tiene respuesta.</p>
    <p v-else>Aún no hay una respuesta registrada para esta solicitud.</p>

    <div v-if="mensajeError" class="alert alert-error">
      <strong>Error del procesamiento:</strong> {{ mensajeError }}
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  estado: { type: String, default: '' },
  respuesta: { type: String, default: '' },
  mensajeError: { type: String, default: '' },
})

const state = computed(() => (props.respuesta ? 'ready' : props.estado === 'ERROR' ? 'error' : 'empty'))
</script>

<style scoped>
.response-box {
  margin-top: 22px;
  padding: 18px 20px;
  border-radius: var(--radius-md);
  background: var(--st-respondida-soft);
  border: 1px solid #bfe8d6;
}

.response-box > span {
  display: block;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--st-respondida);
  margin-bottom: 8px;
}

.response-box p {
  margin: 0;
  line-height: 1.6;
}

.response-box[data-state='empty'] {
  background: var(--canvas);
  border-color: var(--border);
}

.response-box[data-state='empty'] > span,
.response-box[data-state='empty'] p {
  color: var(--ink-faint);
}

.response-box[data-state='error'] {
  background: var(--st-error-soft);
  border-color: #f4c3c5;
}

.response-box[data-state='error'] > span {
  color: var(--st-error);
}

.alert {
  margin-top: 14px;
}
</style>

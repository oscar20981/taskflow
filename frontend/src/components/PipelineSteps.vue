<template>
  <ol class="pipeline" :data-branch="isError">
    <li
      v-for="(step, index) in steps"
      :key="step.key"
      class="pipeline-step"
      :data-state="stateFor(index)"
    >
      <span class="pipeline-marker" />
      <div>
        <strong>{{ step.label }}</strong>
        <span v-if="step.key === status" class="pipeline-current">Estado actual</span>
      </div>
    </li>
  </ol>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true },
})

const order = ['PENDIENTE', 'EN_COLA', 'PROCESANDO', 'RESPONDIDA']
const steps = order.map((key) => ({
  key,
  label: { PENDIENTE: 'Pendiente', EN_COLA: 'En cola', PROCESANDO: 'Procesando', RESPONDIDA: 'Respondida' }[key],
}))

const isError = computed(() => props.status === 'ERROR')

const currentIndex = computed(() => {
  if (isError.value) return order.indexOf('PROCESANDO')
  return order.indexOf(props.status)
})

const stateFor = (index) => {
  if (index < currentIndex.value) return 'done'
  if (index === currentIndex.value) return isError.value ? 'error' : 'active'
  return 'pending'
}
</script>

<style scoped>
.pipeline {
  list-style: none;
  display: flex;
  gap: 0;
  margin: 0;
  padding: 0;
}

.pipeline-step {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  padding-bottom: 4px;
}

.pipeline-step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 6px;
  left: calc(100% - 0px);
  width: 100%;
  height: 2px;
  background: var(--border-strong);
}

.pipeline-step[data-state='done']:not(:last-child)::after {
  background: var(--flow);
}

.pipeline-marker {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid var(--border-strong);
  background: var(--surface);
  flex-shrink: 0;
  z-index: 1;
}

.pipeline-step[data-state='done'] .pipeline-marker {
  background: var(--flow);
  border-color: var(--flow);
}

.pipeline-step[data-state='active'] .pipeline-marker {
  border-color: var(--signal);
  box-shadow: 0 0 0 4px var(--signal-soft);
}

.pipeline-step[data-state='error'] .pipeline-marker {
  border-color: var(--st-error);
  background: var(--st-error);
}

.pipeline-step div {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.pipeline-step strong {
  font-size: 0.85rem;
  color: var(--ink-faint);
}

.pipeline-step[data-state='done'] strong,
.pipeline-step[data-state='active'] strong {
  color: var(--ink);
}

.pipeline-step[data-state='error'] strong {
  color: var(--st-error);
}

.pipeline-current {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--flow);
}

.pipeline-step[data-state='error'] .pipeline-current {
  color: var(--st-error);
}

@media (max-width: 640px) {
  .pipeline {
    flex-direction: column;
    gap: 16px;
  }
  .pipeline-step:not(:last-child)::after {
    display: none;
  }
}
</style>

<template>
  <form class="card request-form" novalidate @submit.prevent="handleSubmit">
    <div v-if="errors.length" class="error-message" role="alert">
      <span v-for="msg in errors" :key="msg" class="error-line">{{ msg }}</span>
    </div>

    <label class="field" :data-invalid="Boolean(fieldErrors.titulo)">
      <span>Título</span>
      <input v-model="form.titulo" type="text" class="input" maxlength="120" placeholder="Resumen breve de la solicitud" />
      <span v-if="fieldErrors.titulo" class="field-error">{{ fieldErrors.titulo }}</span>
    </label>

    <label class="field" :data-invalid="Boolean(fieldErrors.descripcion)">
      <span>Descripción</span>
      <textarea v-model="form.descripcion" class="input" rows="5" maxlength="2000" placeholder="Detalla el contexto y lo que necesitas" />
      <span v-if="fieldErrors.descripcion" class="field-error">{{ fieldErrors.descripcion }}</span>
      <span class="hint">{{ form.descripcion.length }}/2000 caracteres</span>
    </label>

    <div class="field" :data-invalid="Boolean(fieldErrors.categoria)">
      <span>Categoría</span>
      <CategorySelector v-model="form.categoria" />
      <span v-if="fieldErrors.categoria" class="field-error">{{ fieldErrors.categoria }}</span>
    </div>

    <div class="field" :data-invalid="Boolean(fieldErrors.prioridad)">
      <span>Prioridad</span>
      <PrioritySelector v-model="form.prioridad" />
      <span v-if="fieldErrors.prioridad" class="field-error">{{ fieldErrors.prioridad }}</span>
    </div>

    <div class="actions">
      <button type="button" class="btn btn-secondary" @click="$emit('cancel')">Cancelar</button>
      <button type="submit" class="btn btn-primary" :disabled="submitting">
        {{ submitting ? 'Enviando…' : 'Enviar solicitud' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { validateRequest } from '../utils/validateRequest'
import CategorySelector from './CategorySelector.vue'
import PrioritySelector from './PrioritySelector.vue'

const form = defineModel('form', { required: true })
defineProps({
  submitting: { type: Boolean, default: false },
})
const emit = defineEmits(['submit', 'cancel'])

const errors = ref([])
const fieldErrors = ref({})

const handleSubmit = () => {
  const result = validateRequest(form.value)
  errors.value = result.errors
  fieldErrors.value = result.fields
  if (result.valid) emit('submit')
}
</script>

<style scoped>
.request-form {
  display: grid;
  gap: 22px;
  max-width: 640px;
  padding: 26px;
}

.error-line {
  display: block;
}
.error-line + .error-line {
  margin-top: 4px;
}

.field[data-invalid='true'] .input {
  border-color: var(--st-error);
  box-shadow: 0 0 0 3px var(--st-error-soft);
}

.field-error {
  color: var(--st-error);
  font-size: 0.82rem;
  font-weight: 600;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 720px) {
  .request-form {
    padding: 20px;
  }

  .actions {
    flex-direction: column-reverse;
  }

  .actions .btn {
    width: 100%;
    min-height: 44px;
  }
}
</style>

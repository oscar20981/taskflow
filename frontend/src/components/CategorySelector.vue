<template>
  <div class="chip-group" role="radiogroup" aria-label="Categoría">
    <button
      v-for="cat in categories"
      :key="cat.value"
      type="button"
      role="radio"
      class="chip"
      :aria-checked="model === cat.value"
      :data-active="model === cat.value"
      @click="model = cat.value"
    >
      {{ cat.label }}
    </button>
  </div>
</template>

<script setup>
import { categories } from '../utils/categories'

const model = defineModel({ type: String, default: '' })
</script>

<style scoped>
.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  font: inherit;
  font-size: 0.86rem;
  font-weight: 600;
  min-height: 40px;
  padding: 9px 14px;
  border-radius: 999px;
  border: 1px solid var(--border-strong);
  background: var(--surface);
  color: var(--ink-soft);
  cursor: pointer;
  transition: all 0.15s ease;
}

.chip:hover {
  border-color: var(--flow);
}

.chip[data-active='true'] {
  background: var(--flow-soft);
  border-color: var(--flow);
  color: var(--flow-dark);
}
</style>

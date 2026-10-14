<template>
  <div class="segmented" role="radiogroup" aria-label="Prioridad">
    <button
      v-for="level in priorities"
      :key="level"
      type="button"
      role="radio"
      class="segment"
      :aria-checked="model === level"
      :data-active="model === level"
      :data-level="level"
      @click="model = level"
    >
      {{ level }}
    </button>
  </div>
</template>

<script setup>
import { priorities } from '../utils/categories'

const model = defineModel({ type: String, default: '' })
</script>

<style scoped>
.segmented {
  display: inline-flex;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  overflow: hidden;
  width: fit-content;
  max-width: 100%;
}

.segment {
  font: inherit;
  font-weight: 700;
  font-size: 0.88rem;
  min-height: 44px;
  padding: 10px 20px;
  border: none;
  background: var(--surface);
  color: var(--ink-soft);
  cursor: pointer;
  border-right: 1px solid var(--border-strong);
  transition: background-color 0.15s ease, color 0.15s ease;
}

.segment:last-child {
  border-right: none;
}

.segment[data-active='true'][data-level='Baja'] { background: #edeff4; color: var(--ink-soft); }
.segment[data-active='true'][data-level='Media'] { background: var(--signal-soft); color: #a2660f; }
.segment[data-active='true'][data-level='Alta'] { background: var(--st-error-soft); color: var(--st-error); }
</style>

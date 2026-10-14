<template>
  <div class="skeleton-stack" :aria-label="label" role="status">
    <div v-for="row in rows" :key="row" class="skeleton" :style="{ height }" />
  </div>
</template>

<script setup>
defineProps({
  rows: { type: Number, default: 3 },
  height: { type: String, default: '52px' },
  label: { type: String, default: 'Cargando' },
})
</script>

<style scoped>
.skeleton-stack {
  display: grid;
  gap: 10px;
}
</style>

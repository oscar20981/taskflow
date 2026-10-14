<template>
  <div class="card service" :data-ok="ok">
    <span class="service-dot" aria-hidden="true" />
    <div>
      <strong>{{ name }}</strong>
      <span>{{ ok ? 'Disponible' : 'No disponible' }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  name: { type: String, required: true },
  ok: { type: Boolean, default: false },
})
</script>

<style scoped>
.service {
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--st-error);
  flex-shrink: 0;
}

.service[data-ok='true'] .service-dot {
  background: var(--st-respondida);
  box-shadow: 0 0 0 4px var(--st-respondida-soft);
}

.service div {
  display: flex;
  flex-direction: column;
}

.service strong {
  font-size: 0.95rem;
}

.service span {
  font-size: 0.82rem;
  color: var(--ink-soft);
}
</style>

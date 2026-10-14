<template>
  <div class="stat-card" :data-status="status">
    <span v-if="status" class="stat-dot" />
    <div>
      <span>{{ label }}</span>
      <strong>{{ value }}</strong>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], required: true },
  // Estado opcional (PENDIENTE, EN_COLA, PROCESANDO, RESPONDIDA, ERROR) para
  // colorear el indicador de forma consistente con StatusBadge.
  status: { type: String, default: '' },
})
</script>

<style scoped>
.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.stat-card[data-status='PENDIENTE'] .stat-dot { background: var(--st-pendiente); }
.stat-card[data-status='EN_COLA'] .stat-dot { background: var(--st-en_cola); }
.stat-card[data-status='PROCESANDO'] .stat-dot { background: var(--st-procesando); }
.stat-card[data-status='RESPONDIDA'] .stat-dot { background: var(--st-respondida); }
.stat-card[data-status='ERROR'] .stat-dot { background: var(--st-error); }

.stat-card span {
  display: block;
  color: var(--ink-soft);
  font-size: 0.82rem;
  margin-bottom: 3px;
}

.stat-card strong {
  font-size: 1.5rem;
  font-family: var(--font-mono);
  font-weight: 600;
}
</style>

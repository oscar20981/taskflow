<template>
  <span class="pulse" :data-live="connected">
    <span class="pulse-dot" />
    {{ connected ? 'En vivo' : 'Sin conexión' }}
  </span>
</template>

<script setup>
import { ref } from 'vue'
import socket from '../plugins/socket'
import { useSocket } from '../composables/useSocket'

const connected = ref(socket.connected)

useSocket({
  connect: () => (connected.value = true),
  disconnect: () => (connected.value = false),
})
</script>

<style scoped>
.pulse {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--ink-faint);
}

.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--border-strong);
}

.pulse[data-live='true'] {
  color: #0f8a5f;
}

.pulse[data-live='true'] .pulse-dot {
  background: #2ee6a0;
  box-shadow: 0 0 0 0 rgba(46, 230, 160, 0.6);
  animation: breathe 2s ease-in-out infinite;
}

@keyframes breathe {
  0% { box-shadow: 0 0 0 0 rgba(46, 230, 160, 0.55); }
  70% { box-shadow: 0 0 0 6px rgba(46, 230, 160, 0); }
  100% { box-shadow: 0 0 0 0 rgba(46, 230, 160, 0); }
}
</style>

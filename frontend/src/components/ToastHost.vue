<template>
  <div class="toast-host" role="status" aria-live="polite">
    <transition-group name="toast">
      <div v-for="toast in toasts" :key="toast.id" class="toast" :data-type="toast.type">
        <span class="toast-dot" />
        <p>{{ toast.message }}</p>
        <button type="button" class="toast-close" @click="dismiss(toast.id)" aria-label="Cerrar notificación">×</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToast } from '../composables/useToast'

const { toasts, dismiss } = useToast()
</script>

<style scoped>
.toast-host {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  flex-direction: column-reverse;
  gap: 10px;
  max-width: min(360px, calc(100vw - 32px));
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: var(--ink);
  color: white;
  padding: 13px 14px;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-md);
  font-size: 0.9rem;
}

.toast p {
  margin: 0;
  flex: 1;
}

.toast-dot {
  width: 8px;
  height: 8px;
  margin-top: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--flow);
}

.toast[data-type='error'] .toast-dot {
  background: var(--st-error);
}
.toast[data-type='info'] .toast-dot {
  background: var(--signal);
}

.toast-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
}
.toast-close:hover {
  color: white;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(12px);
}

@media (max-width: 720px) {
  .toast-host {
    left: 16px;
    right: 16px;
    bottom: 16px;
    max-width: none;
  }
}
</style>

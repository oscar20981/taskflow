<template>
  <header class="navbar">
    <button
      type="button"
      class="menu-btn"
      :aria-expanded="menuOpen"
      aria-controls="menu-lateral"
      aria-label="Abrir menú de navegación"
      @click="$emit('toggle-menu')"
    >
      <span class="menu-icon" aria-hidden="true" v-html="menuOpen ? icons.close : icons.menu" />
    </button>

    <router-link to="/" class="navbar-brand" aria-label="TaskFlow, ir al Dashboard">
      <span class="navbar-logo">TF</span>
      <strong>TaskFlow</strong>
    </router-link>

    <div class="navbar-end">
      <ConnectionPulse />
      <router-link to="/nueva-solicitud" class="btn btn-primary navbar-cta">Nueva solicitud</router-link>
    </div>
  </header>
</template>

<script setup>
import ConnectionPulse from './ConnectionPulse.vue'
import { icons } from '../assets/icons'

defineProps({
  menuOpen: { type: Boolean, default: false },
})
defineEmits(['toggle-menu'])
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 60px;
  padding: 10px 36px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}

.menu-btn {
  display: none;
  width: 44px;
  height: 44px;
  place-items: center;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--ink);
  cursor: pointer;
}

.menu-icon {
  display: inline-flex;
}

.navbar-brand {
  display: none;
  align-items: center;
  gap: 10px;
  color: var(--ink);
  text-decoration: none;
}

.navbar-logo {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: linear-gradient(155deg, var(--flow), #6f7fff);
  color: white;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 0.8rem;
}

.navbar-end {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 16px;
}

@media (max-width: 860px) {
  .navbar {
    padding: 8px 16px;
  }
  .menu-btn {
    display: grid;
  }
  .navbar-brand {
    display: inline-flex;
  }
}

@media (max-width: 480px) {
  .navbar-cta {
    padding-inline: 12px;
    font-size: 0.85rem;
  }
}
</style>

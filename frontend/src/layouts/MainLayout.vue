<template>
  <div class="app-shell">
    <aside id="menu-lateral" class="rail" :data-open="menuOpen">
      <div class="rail-brand">
        <span class="rail-logo">TF</span>
        <strong>TaskFlow</strong>
      </div>

      <nav aria-label="Navegación principal">
        <router-link to="/" class="rail-link">
          <span class="rail-icon" v-html="icons.dashboard" />
          Dashboard
        </router-link>
        <router-link to="/solicitudes" class="rail-link">
          <span class="rail-icon" v-html="icons.list" />
          Solicitudes
        </router-link>
        <router-link to="/nueva-solicitud" class="rail-link">
          <span class="rail-icon" v-html="icons.plus" />
          Nueva solicitud
        </router-link>
        <router-link to="/monitor" class="rail-link">
          <span class="rail-icon" v-html="icons.pulse" />
          Monitor
        </router-link>
      </nav>

      <p class="rail-foot">Gestión de solicitudes en tiempo real</p>
    </aside>

    <div v-if="menuOpen" class="scrim" @click="menuOpen = false" />

    <div class="main-col">
      <Navbar :menu-open="menuOpen" @toggle-menu="menuOpen = !menuOpen" />
      <main class="content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import { icons } from '../assets/icons'

const menuOpen = ref(false)
const route = useRoute()

// En móvil el menú se cierra al navegar.
watch(() => route.fullPath, () => (menuOpen.value = false))
</script>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
}

.rail {
  width: 250px;
  flex-shrink: 0;
  background: var(--ink);
  color: white;
  padding: 22px 16px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  position: sticky;
  top: 0;
  height: 100vh;
}

.rail-brand {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0 6px;
}

.rail-brand strong {
  font-size: 1.05rem;
  letter-spacing: -0.01em;
}

.rail-logo {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 9px;
  background: linear-gradient(155deg, var(--flow), #6f7fff);
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 0.85rem;
  letter-spacing: 0.02em;
}

nav {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.rail-link {
  display: flex;
  align-items: center;
  gap: 11px;
  min-height: 44px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  padding: 10px 12px;
  border-radius: 9px;
  font-weight: 600;
  font-size: 0.92rem;
  border-left: 2px solid transparent;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.rail-icon {
  display: inline-flex;
  opacity: 0.85;
}

.rail-link:hover {
  background: rgba(255, 255, 255, 0.06);
  color: white;
}

.rail-link.router-link-exact-active {
  background: rgba(52, 80, 255, 0.18);
  color: white;
  border-left-color: var(--flow);
}

.rail-foot {
  margin-top: auto;
  font-size: 0.76rem;
  color: rgba(255, 255, 255, 0.35);
  padding: 0 6px;
  line-height: 1.4;
}

.main-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  min-width: 0;
  padding: 32px 36px;
}

.scrim {
  display: none;
}

/* Móvil y tableta: el menú lateral pasa a ser un panel deslizable que abre el Navbar. */
@media (max-width: 860px) {
  .rail {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 50;
    width: min(280px, 82vw);
    transform: translateX(-100%);
    transition: transform 0.22s ease;
  }
  .rail[data-open='true'] {
    transform: translateX(0);
  }
  .scrim {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 40;
    background: rgba(18, 23, 43, 0.5);
  }
  .content {
    padding: 20px 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rail {
    transition: none;
  }
}
</style>

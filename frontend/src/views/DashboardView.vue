<template>
  <div>
    <PageHeader title="Dashboard" description="Vista general del flujo de solicitudes, actualizada en tiempo real.">
      <template #action>
        <router-link to="/nueva-solicitud" class="btn btn-primary">Nueva solicitud</router-link>
      </template>
    </PageHeader>

    <SkeletonBlock v-if="store.state.loading && !loadedOnce" :rows="1" height="120px" label="Cargando métricas" />
    <p v-else-if="store.state.error" class="error-message">{{ store.state.error }}</p>

    <template v-else>
      <div class="hero-card">
        <div>
          <span>Total de solicitudes</span>
          <strong>{{ store.state.stats.total }}</strong>
        </div>
        <p>{{ activeCount }} en movimiento por el pipeline ahora mismo.</p>
      </div>

      <div class="stats-grid">
        <StatCard v-for="tile in tiles" :key="tile.status" :label="tile.label" :value="tile.value" :status="tile.status" />
      </div>

      <section class="recent">
        <div class="recent-head">
          <h3>Solicitudes recientes</h3>
          <router-link to="/solicitudes" class="btn btn-ghost">Ver todas</router-link>
        </div>
        <EmptyState
          v-if="recent.length === 0"
          title="Aún no hay solicitudes"
          description="Registra la primera solicitud para verla avanzar por la cola."
        />
        <RequestsTable v-else :requests="recent" />
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getRequests } from '../services/requestService'
import { useSocket } from '../composables/useSocket'
import { useRequestStore } from '../store/requestStore'
import PageHeader from '../components/PageHeader.vue'
import StatCard from '../components/StatCard.vue'
import SkeletonBlock from '../components/SkeletonBlock.vue'
import EmptyState from '../components/EmptyState.vue'
import RequestsTable from '../components/RequestsTable.vue'

const store = useRequestStore()
const loadedOnce = ref(false)
const recent = ref([])
let refreshInterval

const tiles = computed(() => [
  { status: 'PENDIENTE', label: 'Pendientes', value: store.state.stats.pendientes },
  { status: 'EN_COLA', label: 'En cola', value: store.state.stats.enCola },
  { status: 'PROCESANDO', label: 'Procesando', value: store.state.stats.procesando },
  { status: 'RESPONDIDA', label: 'Respondidas', value: store.state.stats.respondidas },
  { status: 'ERROR', label: 'Con error', value: store.state.stats.errores },
])

const activeCount = computed(
  () => store.state.stats.pendientes + store.state.stats.enCola + store.state.stats.procesando
)

const loadRecent = async () => {
  try {
    recent.value = (await getRequests({ limit: 5 })).items
  } catch {
    recent.value = []
  }
}

const refresh = () =>
  Promise.all([store.refreshStats(), loadRecent()]).finally(() => (loadedOnce.value = true))

// Sin recargar la página: cada evento Socket.IO vuelve a consultar los indicadores.
useSocket({
  connect: refresh,
  'solicitud-creada': refresh,
  'solicitud-encolada': refresh,
  'solicitud-procesando': refresh,
  'solicitud-respondida': refresh,
  'solicitud-error': refresh,
  'solicitud-actualizada': refresh,
  'solicitud-eliminada': refresh,
  'cola-actualizada': refresh,
})

onMounted(() => {
  refresh()
  refreshInterval = window.setInterval(refresh, 15000)
})

onUnmounted(() => window.clearInterval(refreshInterval))
</script>

<style scoped>
.hero-card {
  background: var(--ink);
  color: white;
  border-radius: var(--radius-lg);
  padding: 28px 30px;
  margin-bottom: 18px;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.hero-card > div span {
  display: block;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.88rem;
  margin-bottom: 6px;
}

.hero-card strong {
  font-size: 3rem;
  line-height: 1;
  font-family: var(--font-mono);
  font-weight: 600;
}

.hero-card p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  max-width: 28ch;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 12px;
}

.recent {
  margin-top: 26px;
}

.recent-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.recent-head h3 {
  margin: 0;
  font-size: 1.05rem;
}
</style>

<template>
  <div>
    <PageHeader title="Monitor" description="Estado de los servicios que sostienen el flujo de solicitudes." />

    <SkeletonBlock v-if="store.state.loading && !loadedOnce" :rows="1" height="200px" />

    <template v-else>
      <p v-if="store.state.error" class="error-message">{{ store.state.error }}</p>

      <div class="service-grid">
        <ServiceStatus name="Express (API)" :ok="store.state.monitor.backend" />
        <ServiceStatus name="MongoDB" :ok="store.state.monitor.mongo" />
        <ServiceStatus name="Redis" :ok="store.state.monitor.redis" />
        <ServiceStatus name="Worker" :ok="store.state.monitor.worker" />
      </div>

      <p v-if="!store.state.monitor.worker && store.state.monitor.backend" class="alert alert-error worker-alert">
        El Worker está detenido: las solicitudes nuevas permanecerán EN COLA hasta que se inicie nuevamente.
      </p>

      <div class="card queue-card">
        <h3>Actividad de la cola</h3>
        <div class="queue-grid">
          <StatCard v-for="tile in tiles" :key="tile.status" :label="tile.label" :value="tile.value" :status="tile.status" />
        </div>
      </div>

      <div class="card queue-card">
        <h3>Eventos en tiempo real</h3>
        <p v-if="events.length === 0" class="events-empty">Esperando actividad… registra una solicitud para ver los eventos.</p>
        <ul v-else class="events">
          <li v-for="event in events" :key="event.id">
            <span class="mono">{{ event.time }}</span>
            <strong>{{ event.label }}</strong>
            <span class="events-id mono">{{ event.detail }}</span>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useSocket } from '../composables/useSocket'
import { useRequestStore } from '../store/requestStore'
import PageHeader from '../components/PageHeader.vue'
import StatCard from '../components/StatCard.vue'
import ServiceStatus from '../components/ServiceStatus.vue'
import SkeletonBlock from '../components/SkeletonBlock.vue'

const store = useRequestStore()
const loadedOnce = ref(false)
const events = ref([])
let refreshInterval
let eventId = 0

const tiles = computed(() => [
  { status: 'EN_COLA', label: 'En cola', value: store.state.monitor.queueLength },
  { status: 'PROCESANDO', label: 'Procesando', value: store.state.stats.procesando },
  { status: 'RESPONDIDA', label: 'Respondidas', value: store.state.stats.respondidas },
  { status: 'ERROR', label: 'Errores', value: store.state.stats.errores },
])

const refresh = () => store.refreshMonitor().finally(() => (loadedOnce.value = true))

const log = (label) => (payload) => {
  const id = payload?.id || payload?._id || ''
  events.value = [
    { id: ++eventId, label, detail: id ? String(id).slice(-8) : '', time: new Date().toLocaleTimeString('es') },
    ...events.value,
  ].slice(0, 12)
}

useSocket({
  connect: refresh,
  'solicitud-creada': log('Nueva solicitud'),
  'solicitud-encolada': log('Entró a la cola'),
  'solicitud-procesando': log('Inicio de procesamiento'),
  'solicitud-respondida': log('Respuesta generada'),
  'solicitud-error': log('Error de procesamiento'),
  'cola-actualizada': refresh,
  'monitor-actualizado': (snapshot) => store.applyMonitor(snapshot),
})

onMounted(() => {
  refresh()
  // El estado del Worker se detecta por su "latido" en Redis, así que se consulta periódicamente.
  refreshInterval = window.setInterval(refresh, 5000)
})

onUnmounted(() => window.clearInterval(refreshInterval))
</script>

<style scoped>
.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.worker-alert {
  margin-bottom: 18px;
}

.queue-card {
  padding: 22px 24px;
  margin-bottom: 18px;
}

.queue-card h3 {
  font-size: 1rem;
  margin-bottom: 14px;
}

.queue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.events {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.events li {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 12px;
  font-size: 0.9rem;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

.events li:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.events .mono,
.events-id {
  color: var(--ink-faint);
  font-size: 0.8rem;
}

.events-empty {
  color: var(--ink-faint);
  margin: 0;
}
</style>

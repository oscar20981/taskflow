<template>
  <div>
    <PageHeader title="Solicitudes" description="Consulta, busca y filtra todas las solicitudes registradas.">
      <template #action>
        <router-link to="/nueva-solicitud" class="btn btn-primary">Nueva solicitud</router-link>
      </template>
    </PageHeader>

    <div class="toolbar card">
      <label class="search">
        <span class="search-icon" v-html="icons.search" />
        <input
          v-model="filters.search"
          type="search"
          placeholder="Buscar por título, descripción o categoría"
          @input="debouncedLoad"
        />
      </label>
      <select v-model="filters.estado" class="input" @change="loadRequests">
        <option value="">Todos los estados</option>
        <option value="PENDIENTE">Pendiente</option>
        <option value="EN_COLA">En cola</option>
        <option value="PROCESANDO">Procesando</option>
        <option value="RESPONDIDA">Respondida</option>
        <option value="ERROR">Error</option>
      </select>
      <select v-model="filters.categoria" class="input" @change="loadRequests">
        <option value="">Todas las categorías</option>
        <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
      </select>
    </div>

    <p v-if="cache" class="cache-note">
      Origen de los datos:
      <span class="cache-chip" :data-cache="cache">CACHE {{ cache }}</span>
      <small>{{ cacheHint }}</small>
    </p>

    <SkeletonBlock v-if="loading" :rows="5" />
    <p v-else-if="error" class="error-message">{{ error }}</p>
    <EmptyState
      v-else-if="requests.length === 0"
      title="No hay solicitudes que coincidan"
      description="Prueba a ajustar la búsqueda o los filtros, o registra una nueva solicitud."
    >
      <router-link to="/nueva-solicitud" class="btn btn-secondary">Registrar solicitud</router-link>
    </EmptyState>

    <RequestsTable v-else :requests="requests" />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { getRequests } from '../services/requestService'
import { useSocket } from '../composables/useSocket'
import { useRequestStore } from '../store/requestStore'
import { categories } from '../utils/categories'
import { icons } from '../assets/icons'
import PageHeader from '../components/PageHeader.vue'
import RequestsTable from '../components/RequestsTable.vue'
import EmptyState from '../components/EmptyState.vue'
import SkeletonBlock from '../components/SkeletonBlock.vue'

const store = useRequestStore()
const requests = ref([])
const loading = ref(true)
const error = ref('')
const cache = ref('')
const filters = reactive({ ...store.state.filters })

const cacheHint = computed(() =>
  cache.value === 'HIT'
    ? 'Servido desde Redis, sin consultar MongoDB.'
    : cache.value === 'MISS'
      ? 'Consultado en MongoDB y guardado en Redis.'
      : 'Redis no disponible: consulta directa a MongoDB.'
)

const loadRequests = async () => {
  try {
    error.value = ''
    store.setFilters(filters)
    const result = await getRequests(filters)
    requests.value = result.items
    cache.value = result.cache
  } catch (requestError) {
    error.value = 'No se pudieron cargar las solicitudes.'
  } finally {
    loading.value = false
  }
}

let debounceTimer
const debouncedLoad = () => {
  window.clearTimeout(debounceTimer)
  debounceTimer = window.setTimeout(loadRequests, 300)
}

useSocket({
  connect: loadRequests,
  'solicitud-actualizada': loadRequests,
  'solicitud-eliminada': loadRequests,
  'solicitud-creada': loadRequests,
  'solicitud-encolada': loadRequests,
  'solicitud-procesando': loadRequests,
  'solicitud-respondida': loadRequests,
  'solicitud-error': loadRequests,
})

onMounted(loadRequests)
onUnmounted(() => window.clearTimeout(debounceTimer))
</script>

<style scoped>
.toolbar {
  display: grid;
  grid-template-columns: minmax(220px, 2fr) repeat(2, minmax(160px, 1fr));
  gap: 12px;
  padding: 12px;
  margin-bottom: 18px;
}

.search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  color: var(--ink-faint);
}

.search-icon {
  display: inline-flex;
}

.search input {
  border: none;
  padding: 10px 0;
  font: inherit;
  width: 100%;
  background: transparent;
}
.search input:focus {
  outline: none;
}

.cache-note {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--ink-soft);
  margin: -6px 0 14px;
}

.cache-note small {
  color: var(--ink-faint);
}

.cache-chip {
  font-family: var(--font-mono);
  font-size: 0.74rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--canvas);
  color: var(--ink-soft);
}

.cache-chip[data-cache='HIT'] {
  background: var(--st-respondida-soft);
  color: var(--st-respondida);
}

.cache-chip[data-cache='MISS'] {
  background: var(--st-pendiente-soft);
  color: var(--st-pendiente-ink);
}

@media (max-width: 720px) {
  .toolbar {
    grid-template-columns: 1fr;
  }
}
</style>

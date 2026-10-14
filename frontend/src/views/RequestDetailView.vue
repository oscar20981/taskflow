<template>
  <div>
    <div class="page-head">
      <div>
        <router-link to="/solicitudes" class="back-link">← Volver a solicitudes</router-link>
        <h2>Detalle de solicitud</h2>
      </div>
    </div>

    <SkeletonBlock v-if="loading" :rows="1" height="220px" />
    <p v-else-if="error" class="error-message">{{ error }}</p>

    <template v-else>
      <div class="card pipeline-card">
        <PipelineSteps :status="request.estado" />
      </div>

      <div class="detail-grid">
        <div class="card detail-main">
          <div class="detail-top">
            <h3>{{ request.titulo }}</h3>
            <StatusBadge :status="request.estado" />
          </div>
          <p class="description">{{ request.descripcion }}</p>

          <ResponsePanel :estado="request.estado" :respuesta="answer.respuesta" :mensaje-error="answer.mensajeError" />
        </div>

        <aside class="card detail-meta">
          <dl>
            <div>
              <dt>ID</dt>
              <dd class="mono">{{ request._id || request.id }}</dd>
            </div>
            <div>
              <dt>Categoría</dt>
              <dd>{{ categoryLabel(request.categoria) }}</dd>
            </div>
            <div>
              <dt>Prioridad</dt>
              <dd>{{ request.prioridad }}</dd>
            </div>
            <div>
              <dt>Creada</dt>
              <dd class="mono">{{ formatDateTime(request.fechaCreacion) }}</dd>
            </div>
            <div>
              <dt>Procesada</dt>
              <dd class="mono">{{ formatDateTime(request.fechaProcesamiento) }}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { getRequestById, getRequestResponse } from '../services/requestService'
import { useSocket } from '../composables/useSocket'
import { formatDateTime } from '../utils/formatDate'
import { categoryLabel } from '../utils/categories'
import StatusBadge from '../components/StatusBadge.vue'
import SkeletonBlock from '../components/SkeletonBlock.vue'
import PipelineSteps from '../components/PipelineSteps.vue'
import ResponsePanel from '../components/ResponsePanel.vue'

const route = useRoute()
const request = ref({})
const answer = ref({ respuesta: '', mensajeError: '' })
const loading = ref(true)
const error = ref('')

const loadRequest = async () => {
  try {
    request.value = await getRequestById(route.params.id)
    // La respuesta se consulta por su propio endpoint: GET /solicitudes/:id/respuesta
    answer.value = await getRequestResponse(route.params.id)
  } catch (requestError) {
    error.value = requestError.response?.data?.message || 'No se pudo cargar la solicitud.'
  } finally {
    loading.value = false
  }
}

const refreshIfCurrentRequest = (update) => {
  if (String(update.id || update._id) === String(route.params.id)) loadRequest()
}

useSocket({
  connect: loadRequest,
  'solicitud-encolada': refreshIfCurrentRequest,
  'solicitud-procesando': refreshIfCurrentRequest,
  'solicitud-respondida': refreshIfCurrentRequest,
  'solicitud-error': refreshIfCurrentRequest,
})

loadRequest()
</script>

<style scoped>
.back-link {
  display: inline-block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ink-faint);
  text-decoration: none;
  margin-bottom: 6px;
}
.back-link:hover {
  color: var(--flow);
}

.pipeline-card {
  padding: 24px 28px;
  margin-bottom: 18px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 18px;
  align-items: start;
}

.detail-main {
  padding: 26px;
}

.detail-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.detail-top h3 {
  font-size: 1.3rem;
  margin: 0;
}

.description {
  color: var(--ink-soft);
  line-height: 1.6;
  margin-bottom: 20px;
}

.detail-meta {
  padding: 22px;
}

.detail-meta dl {
  margin: 0;
  display: grid;
  gap: 16px;
}

.detail-meta dt {
  font-size: 0.78rem;
  color: var(--ink-faint);
  font-weight: 700;
  margin-bottom: 3px;
}

.detail-meta dd {
  margin: 0;
  font-size: 0.94rem;
  word-break: break-word;
}

@media (max-width: 860px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>

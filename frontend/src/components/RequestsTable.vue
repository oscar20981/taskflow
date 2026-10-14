<template>
  <div class="card table-wrap">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Título</th>
          <th>Categoría</th>
          <th>Prioridad</th>
          <th>Estado</th>
          <th>Fecha</th>
          <th class="col-action"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in requests" :key="item._id || item.id">
          <td class="mono id-cell">{{ shortId(item._id || item.id) }}</td>
          <td class="title-cell">{{ item.titulo }}</td>
          <td>{{ categoryLabel(item.categoria) }}</td>
          <td><span class="priority" :data-level="item.prioridad">{{ item.prioridad }}</span></td>
          <td><StatusBadge :status="item.estado" /></td>
          <td class="mono">{{ formatShortDate(item.fechaCreacion) }}</td>
          <td class="col-action">
            <router-link :to="`/solicitudes/${item._id || item.id}`" class="btn btn-ghost">Ver detalle</router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import StatusBadge from './StatusBadge.vue'
import { categoryLabel } from '../utils/categories'
import { formatShortDate } from '../utils/formatDate'

defineProps({
  requests: { type: Array, required: true },
})

const shortId = (id) => (id ? String(id).slice(-6).toUpperCase() : '—')
</script>

<style scoped>
.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
}

th {
  text-align: left;
  padding: 13px 16px;
  font-size: 0.78rem;
  color: var(--ink-faint);
  font-weight: 700;
  border-bottom: 1px solid var(--border);
}

td {
  padding: 13px 16px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr:hover {
  background: var(--canvas);
}

.id-cell {
  color: var(--ink-faint);
}

.title-cell {
  font-weight: 600;
  max-width: 280px;
}

.col-action {
  text-align: right;
}

.priority {
  font-weight: 700;
  font-size: 0.85rem;
}
.priority[data-level='Alta'] { color: var(--st-error); }
.priority[data-level='Media'] { color: #a2660f; }
.priority[data-level='Baja'] { color: var(--ink-faint); }
</style>

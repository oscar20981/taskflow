import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import RequestsView from '../views/RequestsView.vue'
import RequestDetailView from '../views/RequestDetailView.vue'
import NewRequestView from '../views/NewRequestView.vue'
import MonitorView from '../views/MonitorView.vue'

const routes = [
  { path: '/', name: 'dashboard', component: DashboardView },
  { path: '/solicitudes', name: 'requests', component: RequestsView },
  { path: '/solicitudes/:id', name: 'request-detail', component: RequestDetailView, props: true },
  { path: '/nueva-solicitud', name: 'new-request', component: NewRequestView },
  { path: '/monitor', name: 'monitor', component: MonitorView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import RequestsView from '../views/RequestsView.vue'
import RequestDetailView from '../views/RequestDetailView.vue'
import NewRequestView from '../views/NewRequestView.vue'
import MonitorView from '../views/MonitorView.vue'

const routes = [
  { path: '/', name: 'dashboard', component: DashboardView, meta: { title: 'Dashboard' } },
  { path: '/solicitudes', name: 'requests', component: RequestsView, meta: { title: 'Solicitudes' } },
  {
    path: '/solicitudes/:id',
    name: 'request-detail',
    component: RequestDetailView,
    props: true,
    meta: { title: 'Detalle de solicitud' },
  },
  { path: '/nueva-solicitud', name: 'new-request', component: NewRequestView, meta: { title: 'Nueva solicitud' } },
  { path: '/monitor', name: 'monitor', component: MonitorView, meta: { title: 'Monitor' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.afterEach((to) => {
  document.title = to.meta?.title ? `${to.meta.title} · TaskFlow` : 'TaskFlow'
})

export default router

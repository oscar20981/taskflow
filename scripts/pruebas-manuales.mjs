#!/usr/bin/env node
// Ayudante para las pruebas obligatorias que requieren manipular los contenedores.
// Funciona igual en Windows, macOS y Linux (solo necesita Node 18+ y Docker Compose).
//
//   node scripts/pruebas-manuales.mjs cola          -> detiene el Worker, registra 5 solicitudes y muestra que quedan EN COLA
//   node scripts/pruebas-manuales.mjs recuperacion  -> inicia el Worker y muestra cómo procesa las pendientes
//   node scripts/pruebas-manuales.mjs cache         -> muestra CACHE MISS y luego CACHE HIT
//   node scripts/pruebas-manuales.mjs error         -> registra una solicitud con [error] y muestra el estado ERROR
//   node scripts/pruebas-manuales.mjs persistencia  -> reinicia los servicios y compara la cantidad de solicitudes
import { spawnSync } from 'node:child_process'

const API = process.env.TASKFLOW_API_URL || 'http://localhost:4000/api'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const compose = (...args) => {
  console.log(`\n$ docker compose ${args.join(' ')}`)
  const r = spawnSync('docker', ['compose', ...args], { stdio: 'inherit', shell: process.platform === 'win32' })
  if (r.status !== 0) throw new Error(`docker compose ${args[0]} falló`)
}
const get = async (path) => {
  const res = await fetch(`${API}${path}`)
  return { res, body: await res.json() }
}
const crear = async (titulo, categoria = 'Consulta') => {
  const res = await fetch(`${API}/solicitudes`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ titulo, descripcion: `Prueba manual: ${titulo}`, categoria, prioridad: 'Media' }),
  })
  return (await res.json()).data
}
const resumen = async () => {
  const { body } = await get('/monitor')
  const m = body.data
  console.log(`   Worker: ${m.worker ? 'ACTIVO' : 'DETENIDO'} | Cola en Redis: ${m.queueLength} | En cola: ${m.stats.enCola} | Procesando: ${m.stats.procesando} | Respondidas: ${m.stats.respondidas} | Errores: ${m.stats.errores}`)
  return m
}

const pruebas = {
  async cola() {
    compose('stop', 'worker')
    await sleep(16000) // el latido del Worker expira a los 15 s
    console.log('\nRegistrando 5 solicitudes con el Worker detenido...')
    for (let i = 1; i <= 5; i++) console.log('  creada', (await crear(`Prueba de cola ${i}`))._id)
    await sleep(3000)
    const m = await resumen()
    console.log(m.queueLength >= 5 && !m.worker ? '\n✔ CORRECTO: las solicitudes permanecen EN COLA.' : '\n✘ Revisa: se esperaban 5 solicitudes en cola y el Worker detenido.')
    console.log('Toma el pantallazo del Dashboard/Monitor y ejecuta ahora:  node scripts/pruebas-manuales.mjs recuperacion')
  },
  async recuperacion() {
    compose('start', 'worker')
    for (let i = 0; i < 12; i++) {
      await sleep(2500)
      const m = await resumen()
      if (m.queueLength === 0 && m.stats.enCola === 0 && m.stats.procesando === 0) return console.log('\n✔ CORRECTO: el Worker procesó todas las pendientes.')
    }
    console.log('\n✘ Aún quedan solicitudes pendientes; revisa los logs: docker compose logs worker')
  },
  async cache() {
    const titulo = `Prueba de caché ${Date.now()}`
    await crear(titulo)
    await sleep(4000) // espera a que el Worker termine para que no invalide la caché
    const url = `/solicitudes?search=${encodeURIComponent(titulo)}`
    for (const intento of [1, 2]) {
      const { res } = await get(url)
      console.log(`Consulta ${intento}: X-Cache = ${res.headers.get('x-cache')}`)
    }
    console.log('\nEsperado: 1ª consulta MISS (consulta MongoDB y guarda en Redis), 2ª consulta HIT (sale de Redis).')
    console.log('Verifica también el log:  docker compose logs backend | findstr cache   (o grep cache en Linux/macOS)')
  },
  async error() {
    const s = await crear('Prueba de error [error]')
    await sleep(5000)
    const { body } = await get(`/solicitudes/${s._id}`)
    console.log(`Estado: ${body.data.estado}\nmensajeError: ${body.data.mensajeError}`)
    console.log(body.data.estado === 'ERROR' ? '\n✔ CORRECTO: estado ERROR controlado.' : '\n✘ Se esperaba ERROR.')
  },
  async persistencia() {
    const antes = (await get('/estadisticas')).body.data.total
    console.log(`Solicitudes antes del reinicio: ${antes}`)
    compose('restart') // reinicia los contenedores (conserva los volúmenes)
    for (let i = 0; i < 30; i++) {
      await sleep(2000)
      try {
        const despues = (await get('/estadisticas')).body.data.total
        console.log(`Solicitudes después del reinicio: ${despues}`)
        return console.log(despues === antes ? '\n✔ CORRECTO: la información persiste en MongoDB.' : '\n✘ La cantidad cambió.')
      } catch { process.stdout.write('.') }
    }
    console.log('\n✘ El backend no volvió a responder.')
  },
}

const nombre = process.argv[2]
if (!pruebas[nombre]) {
  console.log('Uso: node scripts/pruebas-manuales.mjs <' + Object.keys(pruebas).join('|') + '>')
  process.exit(1)
}
pruebas[nombre]().catch((e) => { console.error('\nError:', e.message); process.exit(1) })

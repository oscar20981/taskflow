// Pruebas de integración: requieren los 5 servicios en marcha (docker compose up -d --build).
// Ejecutar con:  cd backend && npm run test:integration
import assert from 'node:assert/strict'
import test from 'node:test'

const api = process.env.TASKFLOW_API_URL || 'http://127.0.0.1:4000/api'
const json = { 'content-type': 'application/json' }
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const crear = async (datos) => {
  const response = await fetch(`${api}/solicitudes`, { method: 'POST', headers: json, body: JSON.stringify(datos) })
  return { status: response.status, body: await response.json() }
}

const esperarFinal = async (id, timeout = 20000) => {
  const limite = Date.now() + timeout
  while (Date.now() < limite) {
    const { data } = await (await fetch(`${api}/solicitudes/${id}`)).json()
    if (['RESPONDIDA', 'ERROR'].includes(data?.estado)) return data
    await sleep(500)
  }
  throw new Error(`La solicitud ${id} no terminó dentro del tiempo esperado (¿está el Worker en marcha?)`)
}

const base = { titulo: 'Prueba automatizada', descripcion: 'Validación del flujo completo', categoria: 'Consulta', prioridad: 'Media' }

test('el backend reporta MongoDB y Redis disponibles', async () => {
  const response = await fetch(`${api}/health`)
  const body = await response.json()
  assert.equal(response.status, 200)
  assert.equal(body.mongo, true)
  assert.equal(body.redis, true)
})

test('rechaza una solicitud incompleta con 400', async () => {
  const { status, body } = await crear({ titulo: 'Incompleta' })
  assert.equal(status, 400)
  assert.equal(body.success, false)
})

test('Registro + Respuesta: la solicitud pasa por la cola, el Worker y queda RESPONDIDA', async () => {
  const { status, body } = await crear(base)
  assert.equal(status, 201)
  assert.ok(['EN_COLA', 'PROCESANDO'].includes(body.data.estado))

  const final = await esperarFinal(body.data._id)
  assert.equal(final.estado, 'RESPONDIDA')
  assert.ok(final.respuesta)
  assert.ok(final.fechaProcesamiento)
})

test('la respuesta se consulta por su propio endpoint', async () => {
  const { body } = await crear({ ...base, categoria: 'Soporte' })
  const final = await esperarFinal(body.data._id)

  const respuesta = await (await fetch(`${api}/solicitudes/${final._id}/respuesta`)).json()
  assert.equal(respuesta.data.estado, 'RESPONDIDA')
  assert.equal(respuesta.data.respuesta, final.respuesta)
})

test('cada categoría recibe una respuesta distinta y "Otra" recibe la genérica', async () => {
  const categorias = ['Informacion', 'Soporte', 'Documento', 'Consulta', 'Actualizacion']
  const creadas = await Promise.all(categorias.map((categoria) => crear({ ...base, categoria, titulo: `Regla ${categoria}` })))
  const respuestas = await Promise.all(creadas.map(({ body }) => esperarFinal(body.data._id)))
  assert.equal(new Set(respuestas.map((r) => r.respuesta)).size, 5)

  const generica = await crear({ ...base, categoria: 'Otra', titulo: 'xyz', descripcion: 'abc' })
  const final = await esperarFinal(generica.body.data._id)
  assert.match(final.respuesta, /^Hemos recibido tu solicitud/)
})

test('Error: la marca [error] deja la solicitud en ERROR sin detener las demás', async () => {
  const mala = await crear({ ...base, titulo: 'Provocar [error] controlado' })
  const buena = await crear({ ...base, titulo: 'Solicitud posterior normal' })

  const falla = await esperarFinal(mala.body.data._id)
  assert.equal(falla.estado, 'ERROR')
  assert.ok(falla.mensajeError)

  const ok = await esperarFinal(buena.body.data._id)
  assert.equal(ok.estado, 'RESPONDIDA')
})

test('Caché: la primera consulta es CACHE MISS y la siguiente CACHE HIT', async () => {
  const titulo = `Caché ${Date.now()}`
  const { body } = await crear({ ...base, titulo })
  await esperarFinal(body.data._id)
  await sleep(500)

  const url = `${api}/solicitudes?search=${encodeURIComponent(titulo)}`
  const primera = await fetch(url)
  assert.equal(primera.headers.get('x-cache'), 'MISS')
  assert.equal((await primera.json()).data.length, 1)

  const segunda = await fetch(url)
  assert.equal(segunda.headers.get('x-cache'), 'HIT')
})

test('estadísticas e indicadores del monitor', async () => {
  const { data } = await (await fetch(`${api}/estadisticas`)).json()
  for (const clave of ['total', 'pendientes', 'enCola', 'procesando', 'respondidas', 'errores']) assert.equal(typeof data[clave], 'number')

  const monitor = (await (await fetch(`${api}/monitor`)).json()).data
  assert.equal(monitor.mongo, true)
  assert.equal(monitor.redis, true)
  assert.equal(typeof monitor.worker, 'boolean')
})

test('actualizar, eliminar y consultar ids inexistentes', async () => {
  const { body } = await crear({ ...base, categoria: 'Informacion' })
  const id = body.data._id

  const put = await fetch(`${api}/solicitudes/${id}`, { method: 'PUT', headers: json, body: JSON.stringify({ prioridad: 'Alta' }) })
  assert.equal(put.status, 200)
  assert.equal((await put.json()).data.prioridad, 'Alta')

  assert.equal((await fetch(`${api}/solicitudes/${id}`, { method: 'DELETE' })).status, 200)
  assert.equal((await fetch(`${api}/solicitudes/${id}`)).status, 404)
  assert.equal((await fetch(`${api}/solicitudes/no-es-un-id`)).status, 404)
})

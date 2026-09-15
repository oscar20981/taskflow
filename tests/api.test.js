import assert from 'node:assert/strict'
import test from 'node:test'

const apiUrl = process.env.TASKFLOW_API_URL || 'http://127.0.0.1:4000/api'

const waitForResponse = async (requestId) => {
  const deadline = Date.now() + 15000

  while (Date.now() < deadline) {
    const response = await fetch(`${apiUrl}/solicitudes/${requestId}`)
    const body = await response.json()

    if (body.data?.status === 'RESPONDIDA' || body.data?.status === 'ERROR') {
      return body.data
    }

    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  throw new Error('La solicitud no terminó dentro del tiempo esperado')
}

test('el backend reporta sus dependencias saludables', async () => {
  const response = await fetch(`${apiUrl}/health`)
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.equal(body.status, 'ok')
  assert.equal(body.mongo, true)
  assert.equal(body.redis, true)
})

test('rechaza una solicitud incompleta', async () => {
  const response = await fetch(`${apiUrl}/solicitudes`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title: 'Incompleta' }),
  })
  const body = await response.json()

  assert.equal(response.status, 400)
  assert.equal(body.success, false)
})

test('procesa una solicitud mediante Redis, worker y MongoDB', async () => {
  const response = await fetch(`${apiUrl}/solicitudes`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      title: 'Prueba automatizada',
      description: 'Validación del flujo completo',
      category: 'Consulta',
      priority: 'Media',
    }),
  })
  const body = await response.json()

  assert.equal(response.status, 201)
  assert.equal(body.success, true)
  assert.ok(body.data._id)

  const processedRequest = await waitForResponse(body.data._id)
  assert.equal(processedRequest.status, 'RESPONDIDA')
  assert.ok(processedRequest.response)
  assert.ok(processedRequest.processedAt)
})

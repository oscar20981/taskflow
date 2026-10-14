import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';
import { createApp } from '../src/app.js';

// Sin MongoDB ni Redis conectados, la API debe responder 503 y NO guardar nada en memoria.
const withServer = async (fn) => {
  const server = createServer(createApp());
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    await fn(`http://127.0.0.1:${server.address().port}/api`);
  } finally {
    server.close();
  }
};

test('/health informa degradado (503) sin dependencias', () =>
  withServer(async (api) => {
    const response = await fetch(`${api}/health`);
    const body = await response.json();
    assert.equal(response.status, 503);
    assert.equal(body.status, 'degraded');
  }));

test('registrar una solicitud responde 503 y no usa almacenamiento local', () =>
  withServer(async (api) => {
    const response = await fetch(`${api}/solicitudes`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ titulo: 'x', descripcion: 'y', categoria: 'Soporte', prioridad: 'Baja' }),
    });
    assert.equal(response.status, 503);
  }));

test('una ruta inexistente responde 404 con mensaje controlado', () =>
  withServer(async (api) => {
    const response = await fetch(`${api}/no-existe`);
    assert.equal(response.status, 404);
    assert.equal((await response.json()).success, false);
  }));

test('un JSON inválido responde 400 sin detalles técnicos', () =>
  withServer(async (api) => {
    const response = await fetch(`${api}/health`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{malo' });
    assert.equal(response.status, 400);
  }));

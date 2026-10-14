import assert from 'node:assert/strict';
import test from 'node:test';
import { REGLAS, generarRespuesta, identificarCategoria, RESPUESTA_GENERICA } from '../src/rules/respuestas.js';
import { ErrorControlado, procesarSolicitud } from '../src/rules/procesador.js';

const base = { _id: '66f000000000000000000001', titulo: 'Hola', descripcion: 'Texto', prioridad: 'Media' };

test('existen al menos cinco categorías con respuesta predefinida', () => {
  assert.ok(Object.keys(REGLAS).length >= 5);
});

test('cada categoría recibe la respuesta de su regla', () => {
  for (const categoria of Object.keys(REGLAS)) {
    const resultado = generarRespuesta({ ...base, categoria });
    assert.equal(resultado.categoria, categoria);
    assert.equal(resultado.generica, false);
    assert.ok(resultado.respuesta.length > 20);
  }
});

test('las respuestas de categorías distintas son distintas', () => {
  const respuestas = Object.keys(REGLAS).map((categoria) => generarRespuesta({ ...base, categoria }).respuesta);
  assert.equal(new Set(respuestas).size, respuestas.length);
});

test('una categoría sin regla se deduce por palabras clave', () => {
  assert.equal(identificarCategoria({ ...base, categoria: 'Otra', titulo: 'Necesito un certificado' }), 'Documento');
});

test('sin coincidencias se usa la respuesta genérica', () => {
  const resultado = generarRespuesta({ ...base, categoria: 'Otra', titulo: 'xyz', descripcion: 'abc' });
  assert.equal(resultado.generica, true);
  assert.equal(resultado.respuesta, RESPUESTA_GENERICA());
});

test('la marca [error] provoca un error controlado', () => {
  assert.throws(() => procesarSolicitud({ ...base, categoria: 'Soporte', titulo: 'Prueba [ERROR]' }), ErrorControlado);
});

test('una solicitud normal se procesa sin errores', () => {
  assert.ok(procesarSolicitud({ ...base, categoria: 'Soporte' }));
});

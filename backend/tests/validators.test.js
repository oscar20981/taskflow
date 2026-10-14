import assert from 'node:assert/strict';
import test from 'node:test';
import { validarSolicitud } from '../src/utils/validators.js';

const valida = { titulo: 'Certificado', descripcion: 'Necesito un certificado', categoria: 'Documento', prioridad: 'Alta' };

test('acepta una solicitud completa y recorta espacios', () => {
  const { errores, datos } = validarSolicitud({ ...valida, titulo: '  Certificado  ' });
  assert.deepEqual(errores, []);
  assert.equal(datos.titulo, 'Certificado');
});

test('rechaza campos obligatorios vacíos', () => {
  const { errores } = validarSolicitud({ titulo: '   ' });
  assert.equal(errores.length, 4);
});

test('rechaza títulos y descripciones demasiado largos', () => {
  assert.equal(validarSolicitud({ ...valida, titulo: 'a'.repeat(121) }).errores.length, 1);
  assert.equal(validarSolicitud({ ...valida, descripcion: 'a'.repeat(2001) }).errores.length, 1);
});

test('rechaza una prioridad desconocida', () => {
  assert.equal(validarSolicitud({ ...valida, prioridad: 'Urgente' }).errores.length, 1);
});

test('en modo parcial solo valida los campos enviados', () => {
  assert.deepEqual(validarSolicitud({ prioridad: 'Baja' }, { parcial: true }).errores, []);
  assert.equal(validarSolicitud({}, { parcial: true }).errores.length, 1);
});

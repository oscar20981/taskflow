#!/usr/bin/env node
// Crea un Issue por historia de usuario con GitHub CLI (gh). Ejecutar dentro del repo ya subido a GitHub.
import { spawnSync } from 'node:child_process'

const historias = [
  'HU-01 Registrar una solicitud',
  'HU-02 Consultar listado de solicitudes',
  'HU-03 Consultar detalle y respuesta',
  'HU-04 Enviar una solicitud a la cola',
  'HU-05 Procesar una solicitud mediante el Worker',
  'HU-06 Generar respuesta automática',
  'HU-07 Gestionar estados de la solicitud',
  'HU-08 Consultar información mediante caché',
  'HU-09 Consultar el monitor del sistema',
  'HU-10 Mantener la información después de reiniciar Docker',
  'HU-11 Manejar errores de procesamiento',
  'HU-12 Utilizar arquitectura organizada en Vue 3',
  'HU-13 Ejecutar el sistema mediante Docker Compose',
  'HU-14 Implementar diseño responsive',
  'HU-15 Gestionar el proyecto mediante Git y GitHub',
  'HU-16 Actualización de estados en tiempo real',
]

for (const titulo of historias) {
  const r = spawnSync('gh', ['issue', 'create', '--title', titulo, '--body', 'Ver criterios de aceptación en el documento del taller.', '--label', 'historia-de-usuario'], { stdio: 'inherit', shell: process.platform === 'win32' })
  if (r.status !== 0) { console.error('Falló la creación. ¿Está instalado gh y creada la etiqueta "historia-de-usuario"? (gh label create historia-de-usuario)'); process.exit(1) }
}

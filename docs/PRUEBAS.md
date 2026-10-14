# Documento de pruebas — TaskFlow

Levantar todo: `docker compose up -d --build` → frontend http://localhost:5173 · API http://localhost:4000/api

Pruebas automáticas (sin Docker): `cd backend && npm test` · `cd worker && npm test`
Pruebas de integración (con Docker arriba): `cd backend && npm run test:integration`

Completa la columna **Evidencia** con el pantallazo y marca el resultado.

| # | Prueba | Cómo ejecutarla | Resultado esperado | Evidencia | ✔/✘ |
|---|---|---|---|---|---|
| 1 | Servicios | `docker compose ps` | 5 servicios `Up` (backend, mongoserver y redisserver `healthy`) | _pantallazo_ | |
| 2 | Registro | Formulario → Enviar | Mensaje de éxito; aparece en el listado | _pantallazo_ | |
| 3 | Respuesta | Abrir el detalle de la solicitud | Estado RESPONDIDA y panel de respuesta | _pantallazo_ | |
| 4 | Categorías | Registrar una por categoría | Cada una recibe una respuesta distinta; "Otra" recibe la genérica | _pantallazo_ | |
| 5 | Cola | `node scripts/pruebas-manuales.mjs cola` | Worker detenido; 5 solicitudes EN COLA | _pantallazo del Monitor_ | |
| 6 | Recuperación | `node scripts/pruebas-manuales.mjs recuperacion` | El Worker procesa las 5 pendientes | _pantallazo_ | |
| 7 | Caché | `node scripts/pruebas-manuales.mjs cache` o pestaña Network → `X-Cache` | 1ª MISS, 2ª HIT (también visible en el Listado) | _pantallazo_ | |
| 8 | Persistencia | `node scripts/pruebas-manuales.mjs persistencia` | Misma cantidad de solicitudes tras reiniciar | _pantallazo_ | |
| 9 | Error | `node scripts/pruebas-manuales.mjs error` o título con `[error]` | Estado ERROR con `mensajeError`; las demás siguen procesándose | _pantallazo_ | |
| 10 | Tiempo real | Dos pestañas: Dashboard y Nueva solicitud | El Dashboard cambia sin recargar | _pantallazo/video_ | |
| 11 | Responsive | DevTools → móvil y tablet | Sin desbordes; formulario usable | _pantallazo_ | |
| 12 | Sin dependencias | `docker compose stop mongoserver` y registrar | La API responde 503 (nada se guarda en memoria) | _pantallazo_ | |

Nota: para provocar un error controlado se escribe `[error]` en el título o la descripción (regla del Worker, `worker/src/rules/procesador.js`).

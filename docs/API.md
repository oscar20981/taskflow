# Diseño de la API — TaskFlow

Base URL: `http://localhost:4000/api` · Formato: JSON · Errores: `{ "success": false, "message": "..." }` (sin detalles técnicos).

## Modelo `Solicitud` (MongoDB)

| Campo | Tipo | Notas |
|---|---|---|
| `_id` | ObjectId | Identificador único |
| `titulo` | string | Obligatorio, máx. 120 |
| `descripcion` | string | Obligatorio, máx. 2000 |
| `categoria` | string | Informacion, Soporte, Documento, Consulta, Actualizacion u Otra |
| `prioridad` | string | `Baja`, `Media`, `Alta` |
| `estado` | string | `PENDIENTE`, `EN_COLA`, `PROCESANDO`, `RESPONDIDA`, `ERROR` |
| `respuesta` | string | La genera el Worker |
| `mensajeError` | string | Solo si `estado = ERROR` |
| `fechaCreacion` / `fechaActualizacion` | Date | Automáticas |
| `fechaProcesamiento` | Date \| null | La asigna el Worker |

## Endpoints

| Método | Ruta | Descripción | Códigos |
|---|---|---|---|
| POST | `/solicitudes` | Registra, deja `EN_COLA` y encola el id en Redis | 201, 400, 503 |
| GET | `/solicitudes` | Lista (con caché). Filtros: `search`, `categoria`, `prioridad`, `estado`, `limit` | 200, 503 |
| GET | `/solicitudes/:id` | Detalle | 200, 404 |
| GET | `/solicitudes/:id/respuesta` | Solo estado, respuesta y mensajeError | 200, 404 |
| PUT | `/solicitudes/:id` | Actualiza titulo, descripcion, categoria o prioridad | 200, 400, 404 |
| DELETE | `/solicitudes/:id` | Elimina | 200, 404 |
| GET | `/estadisticas` | Contadores del Dashboard (con caché) | 200 |
| GET | `/monitor` | Estado de Express, MongoDB, Redis, Worker, cola y contadores | 200 |
| GET | `/health` | Healthcheck de Docker (503 si falta MongoDB o Redis) | 200, 503 |

Las respuestas con caché incluyen la cabecera `X-Cache: HIT | MISS | BYPASS` y `meta.cache`.

## Eventos Socket.IO (servidor → navegador)

`solicitud-creada`, `solicitud-encolada`, `solicitud-procesando`, `solicitud-respondida`, `solicitud-error`, `solicitud-actualizada`, `solicitud-eliminada`, `cola-actualizada` (`{queueLength}`), `monitor-actualizado` (instantánea del monitor).

## Redis

| Clave / canal | Uso |
|---|---|
| `taskflow:queue` (lista) | Cola FIFO: el backend hace `LPUSH` del id, el Worker `BLPOP` |
| `taskflow:updates` (pub/sub) | El Worker informa cambios de estado al backend |
| `taskflow:worker:heartbeat` (TTL 15 s) | Indica que el Worker está activo |
| `taskflow:cache:*` | Caché (TTL `CACHE_TTL_SECONDS`, se invalida en cada escritura) |

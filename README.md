# TaskFlow

Sistema distribuido para registrar solicitudes y procesarlas de forma asíncrona. El usuario crea una solicitud en la interfaz Vue; el backend la guarda en MongoDB y la envía a una cola en Redis; un Worker independiente la procesa, genera una respuesta automática según su categoría y el resultado se refleja **en tiempo real** (Socket.IO) en la interfaz.

```
Vue 3 ──► Express API ──► MongoDB (PENDIENTE → EN_COLA)
              │  └──────► Redis queue ──► Worker ──► MongoDB (PROCESANDO → RESPONDIDA | ERROR)
              ◄── Redis pub/sub ◄─────────────┘
              └─ Socket.IO ──► Vue (Dashboard, Listado, Detalle, Monitor)
```

## Integrantes

| Nombre | Rol | Usuario de GitHub |
|---|---|---|
| _Aprendiz 1_ | _completar_ | _completar_ |
| _Aprendiz 2_ | _completar_ | _completar_ |

## Tecnologías

Vue 3 + Vite · Node.js + Express + Mongoose · MongoDB 7 · Redis 7 · Socket.IO · Docker Compose · nginx (frontend).

## Ejecución

Requisitos: Docker y Docker Compose.

```bash
cp .env.example .env        # opcional: todas las variables tienen valor por defecto
docker compose up -d --build
```

| Servicio | Contenedor | URL / puerto |
|---|---|---|
| Frontend | `frontend` | http://localhost:5173 |
| Backend (API) | `backend` | http://localhost:4000/api |
| Worker | `worker` | — |
| MongoDB | `mongoserver` | `mongoserver:27017` (interno) / `localhost:27017` |
| Redis | `redisserver` | `redisserver:6379` (interno) / `localhost:6379` |

Detener: `docker compose down` (conserva los datos) · Borrar datos: `docker compose down -v`.
Logs: `docker compose logs -f backend worker`.

## Funcionalidades

- Registro de solicitudes con validación (cliente y servidor), listado con filtros y búsqueda, detalle con panel de respuesta.
- Cola en Redis + Worker independiente con 5 reglas por categoría (Información, Soporte, Documento, Consulta, Actualización) y respuesta genérica para el resto (“Otra”).
- Caché de consultas en Redis con `CACHE MISS` / `CACHE HIT` (cabecera `X-Cache`, visible en el Listado y en los logs del backend).
- Monitor de Express, MongoDB, Redis y Worker, con cola y eventos en vivo.
- Persistencia en volúmenes de Docker; recuperación de solicitudes pendientes al reiniciar el Worker.
- Errores controlados: escribir `[error]` en el título o la descripción lleva la solicitud a estado `ERROR` con su `mensajeError`.
- Sin MongoDB o Redis la API responde 503: no existe respaldo en memoria que pueda perder datos.

## Estructura

```
backend/src   config · models · services · controllers · routes · middlewares · sockets · utils
worker/src    config · models · rules (respuestas, procesador) · worker.js
frontend/src  views · components · layouts · router · services · store · composables · plugins · utils · styles
tests/        pruebas de integración        docs/   API, pantallas, pruebas, GitHub, arquitectura
scripts/      pruebas manuales y creación de Issues
```

## Pruebas

```bash
cd backend && npm test                   # unidad + API sin dependencias
cd worker  && npm test                   # reglas de respuesta y error simulado
cd backend && npm run test:integration   # flujo completo (con docker compose arriba)
node scripts/pruebas-manuales.mjs cola | recuperacion | cache | error | persistencia
```

## Documentación

[Arquitectura](docs/ARQUITECTURA_TASKFLOW.md) · [Diseño de la API](docs/API.md) · [Prototipo de pantallas](docs/PANTALLAS.md) · [Documento de pruebas](docs/PRUEBAS.md) · [Flujo de GitHub](docs/GITHUB.md)

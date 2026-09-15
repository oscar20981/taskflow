# TaskFlow

Proyecto Full Stack para la gestión de solicitudes con Vue 3, Express, MongoDB, Redis, Worker y Docker Compose.

## Requisitos

- Docker Desktop
- Docker Compose
- Node.js 18+

## Inicio rápido con Docker

1. Copia el archivo `.env.example` a `.env`
2. Ejecuta:

```bash
docker compose up --build
```

Para ejecutar en segundo plano:

```bash
docker compose up --build -d
docker compose ps
docker compose logs -f backend worker
```

Para detener los servicios:

```bash
docker compose down
```

Para eliminar también los datos locales de MongoDB:

```bash
docker compose down -v
```

La aplicación queda disponible en:

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api
- MongoDB: mongodb://localhost:27017
- Redis: redis://localhost:6379

## Estructura

```text
.
├── frontend/
├── backend/
├── worker/
├── docker-compose.yml
├── .env.example
├── README.md
└── .gitignore
```

## Funcionalidades

- Registro de solicitudes
- Listado y detalle
- Estados: PENDIENTE, EN_COLA, PROCESANDO, RESPONDIDA, ERROR
- Cola Redis y worker asíncrono
- Socket.IO para actualizaciones en tiempo real
- Dockerizados

## Salud y operación

El endpoint `GET /api/health` informa el estado de MongoDB, Redis, la cola y las métricas. Devuelve HTTP 200 cuando las dependencias están disponibles y HTTP 503 cuando el backend está degradado.

El worker procesa solicitudes desde Redis y actualiza MongoDB con los estados `PROCESANDO`, `RESPONDIDA` o `ERROR`. El frontend refresca las métricas y solicitudes mediante Socket.IO y consultas periódicas.

Para ejecutar las pruebas de integración con Docker levantado:

```bash
cd backend
npm test
```

En producción se debe restringir `FRONTEND_URL`, proteger MongoDB y Redis con credenciales y no publicar sus puertos directamente a Internet.

## Scripts del proyecto

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### Worker

```bash
cd worker
npm install
npm run dev
```

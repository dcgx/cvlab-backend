# cvlab-backend

API NestJS con Prisma y Supabase (PostgreSQL).

## Requisitos

- Node.js 18+
- pnpm
- Cuenta en [Supabase](https://supabase.com)

## Configuración de Supabase

1. Crear un proyecto en [supabase.com](https://supabase.com).
2. Ir a **Settings → Database → Connection string** y elegir **URI**.
3. Copiar la URI y reemplazar `[YOUR-PASSWORD]` por la contraseña de la base de datos del proyecto.
4. Crear un archivo `.env` en la raíz del backend (copiar desde `.env.example`) y pegar la URI como `DATABASE_URL`.

```env
DATABASE_URL=postgresql://postgres:TU_PASSWORD@db.XXXX.supabase.co:5432/postgres
```

No commitear `.env`; solo usar `.env.example` con placeholders para documentar variables.

## Instalación

```bash
cd cvlab-backend
pnpm install
```

## Prisma

Generar el cliente Prisma (necesario antes de levantar la app):

```bash
pnpm prisma generate
```

Cuando el schema tenga modelos, primera migración:

```bash
pnpm prisma migrate dev --name init
```

## Desarrollo

```bash
pnpm run start:dev
```

La API queda en `http://localhost:3000` (o el `PORT` definido en `.env`).

### Endpoints

- **GET /health** — Estado de la API y conexión a la base de datos. Responde 200 con `{ status: 'ok', database: 'connected' | 'disconnected' }`.

## Build

```bash
pnpm run build
```

## Producción

```bash
pnpm prisma migrate deploy
pnpm run start:prod
```

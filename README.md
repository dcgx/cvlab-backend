# cvlab-backend

API NestJS con Prisma y Supabase (PostgreSQL).

## Requisitos

- Node.js 18+
- pnpm
- Cuenta en [Supabase](https://supabase.com)

## Configuración de Supabase

1. Crear un proyecto en [supabase.com](https://supabase.com).
2. **Connection string**: Settings → Database → Connection string → URI.
3. Copiar la URI y reemplazar `[YOUR-PASSWORD]` por la contraseña de la base de datos.
4. **API keys** (para auth): Settings → API → `anon` public key.
5. Crear `.env` copiando `.env.example` y rellenar:
   - `DATABASE_URL` — connection string de la base de datos
   - `SUPABASE_URL` — Project URL
   - `SUPABASE_ANON_KEY` — anon public key (requerido para auth)

```env
DATABASE_URL=postgresql://postgres:TU_PASSWORD@db.XXXX.supabase.co:5432/postgres
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
```

No commitear `.env`; solo usar `.env.example` con placeholders para documentar variables.

### Migraciones y seed

```bash
# Aplicar migraciones a Supabase
pnpm prisma migrate deploy

# Seed (usuario dev por defecto)
pnpm prisma db seed

# Prisma Studio (explorar tablas)
pnpm prisma studio
```

### Si falla P1001 "Can't reach database server"

La conexión directa usa IPv6. Si tu red no lo soporta, usa el **pooler**:
1. Supabase Dashboard → **Connect** → **Session** (o Transaction)
2. Copia la connection string (formato `pooler.supabase.com`)
3. Para Transaction (puerto 6543), añade `?pgbouncer=true` al final

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

# cvlab-backend

API Bun con Prisma y Supabase (PostgreSQL).

## Requisitos

- [Bun](https://bun.sh) (runtime principal)
- pnpm o bun (gestor de paquetes)
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
bun prisma migrate deploy

# Seed (usuario dev por defecto)
bun prisma db seed

# Prisma Studio (explorar tablas)
bun prisma studio
```

### Si falla P1001 "Can't reach database server"

La conexión directa usa IPv6. Si tu red no lo soporta, usa el **pooler**:
1. Supabase Dashboard → **Connect** → **Session** (o Transaction)
2. Copia la connection string (formato `pooler.supabase.com`)
3. Para Transaction (puerto 6543), añade `?pgbouncer=true` al final

## Instalación

```bash
cd cvlab-api  # o cvlab-backend
pnpm install  # o bun install
```

## Prisma

Generar el cliente Prisma (necesario antes de levantar la app):

```bash
bun prisma generate
```

Cuando el schema tenga modelos, primera migración:

```bash
bun prisma migrate dev --name init
```

## Desarrollo

```bash
bun run dev
```

La API queda en `http://localhost:3000/api` (o el `PORT` definido en `.env`).

### Endpoints

- **GET /api/health** — Estado de la API y conexión a la base de datos
- **GET/POST/PATCH/DELETE /api/cvs** — CRUD de CVs
- **GET /api/cvs/:id/pdf** — Descargar CV en PDF
- **GET/POST/PATCH /api/applications** — Postulaciones
- **POST /api/job-offers/analyze-and-generate-cv** — Analizar oferta y generar CV

## Build

```bash
bun run build
```

## Producción

```bash
bun prisma migrate deploy
bun run start
```

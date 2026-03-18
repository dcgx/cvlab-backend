import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { loadSupabaseEnv } from './config/env.loader';
import { connectPrisma } from './lib/prisma';
import { healthRoutes } from './routes/health';
import { cvRoutes } from './routes/cv';
import { applicationsRoutes } from './routes/applications';
import { jobOffersRoutes } from './routes/job-offers';

loadSupabaseEnv();

const port = Number(process.env.PORT ?? 3000);

const app = new Elysia()
  .use(cors())
  .group('/api', (app) =>
    app
      .use(healthRoutes)
      .use(cvRoutes)
      .use(applicationsRoutes)
      .use(jobOffersRoutes),
  )
  .onError(({ code, error }) => {
    if (code === 'VALIDATION') {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }
    if (error instanceof Error && error.message.includes('No se pudo obtener')) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }
    if (error instanceof Error && error.message.includes('no existe')) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }
    console.error(error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  })
  .listen(port);

await connectPrisma();

console.log(`🚀 API running at http://localhost:${port}/api`);

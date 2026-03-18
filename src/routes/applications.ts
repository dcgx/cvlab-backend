import { Elysia, t } from 'elysia';
import { optionalAuth } from '../lib/auth';
import { ApplicationsService } from '../services/applications.service';

const applicationsService = new ApplicationsService();

export const applicationsRoutes = new Elysia({ prefix: '/applications' })
  .use(optionalAuth)
  .get('/', async ({ userId, query }) => {
    return applicationsService.findAll(userId, {
      cvId: query.cvId,
      company: query.company,
      status: query.status,
      from: query.from,
      to: query.to,
    });
  }, {
    query: t.Object({
      cvId: t.Optional(t.String()),
      company: t.Optional(t.String()),
      status: t.Optional(t.String()),
      from: t.Optional(t.String()),
      to: t.Optional(t.String()),
    }),
  })
  .get('/:id', async ({ userId, params }) => {
    const app = await applicationsService.findOne(userId, params.id);
    if (!app) {
      return new Response(JSON.stringify({ error: 'Postulación no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return app;
  })
  .post('/', async ({ userId, body }) => {
    return applicationsService.create(userId, body);
  }, {
    body: t.Object({
      jobOfferId: t.String(),
      cvId: t.Optional(t.String()),
      status: t.Optional(t.String()),
    }),
  })
  .patch('/:id', async ({ userId, params, body }) => {
    const app = await applicationsService.update(userId, params.id, body);
    if (!app) {
      return new Response(JSON.stringify({ error: 'Postulación no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return app;
  }, {
    body: t.Object({
      status: t.Optional(t.String()),
      notes: t.Optional(t.String()),
    }),
  });

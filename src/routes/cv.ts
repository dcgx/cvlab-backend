import { Elysia, t } from 'elysia';
import { optionalAuth } from '../lib/auth';
import { CvService } from '../services/cv.service';
import { PdfService } from '../services/pdf.service';

const pdfService = new PdfService();
const cvService = new CvService(pdfService);

export const cvRoutes = new Elysia({ prefix: '/cvs' })
  .use(optionalAuth)
  .get('/', async ({ userId }) => cvService.findAll(userId))
  .get('/:id/pdf', async ({ userId, params }) => {
    const buffer = await cvService.generatePdfBuffer(userId, params.id);
    if (!buffer) {
      return new Response(JSON.stringify({ error: 'CV no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const filename = `cv-${params.id}.pdf`;
    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  })
  .get('/:id', async ({ userId, params }) => {
    const cv = await cvService.findOne(userId, params.id);
    if (!cv) {
      return new Response(JSON.stringify({ error: 'CV no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return cv;
  })
  .post('/', async ({ userId, body }) => {
    return cvService.create(userId, body as Record<string, unknown>);
  }, {
    body: t.Record(t.String(), t.Any()),
  })
  .patch('/:id', async ({ userId, params, body }) => {
    const cv = await cvService.update(userId, params.id, body as Record<string, unknown>);
    if (!cv) {
      return new Response(JSON.stringify({ error: 'CV no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return cv;
  }, {
    body: t.Record(t.String(), t.Any()),
  })
  .delete('/:id', async ({ userId, params }) => {
    const deleted = await cvService.delete(userId, params.id);
    if (!deleted) {
      return new Response(JSON.stringify({ error: 'CV no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return { success: true };
  });

import { Elysia, t } from 'elysia';
import { optionalAuth } from '../lib/auth';
import { JobOffersService } from '../services/job-offers.service';
import { CvService } from '../services/cv.service';
import { PdfService } from '../services/pdf.service';

const pdfService = new PdfService();
const cvService = new CvService(pdfService);
const jobOffersService = new JobOffersService(cvService);

export const jobOffersRoutes = new Elysia({ prefix: '/job-offers' })
  .use(optionalAuth)
  .post('/analyze-and-generate-cv', async ({ userId, body }) => {
    if ((!body.rawText || body.rawText.length < 10) && !body.sourceUrl) {
      return new Response(
        JSON.stringify({ error: 'rawText o sourceUrl es requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }
    try {
      return await jobOffersService.analyzeAndGenerateCv(userId, body);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      return new Response(
        JSON.stringify({ error: msg }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }
  }, {
    body: t.Object({
      title: t.String({ minLength: 1 }),
      rawText: t.Optional(t.String()),
      sourceUrl: t.Optional(t.String()),
      baseCvId: t.Optional(t.String()),
    }),
  });

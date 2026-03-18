import * as PDFDocument from 'pdfkit';

export interface CvData {
  personalInfo?: Record<string, unknown>;
  experience?: unknown[];
  education?: unknown[];
  skills?: { technical?: string[]; soft?: string[] };
  languages?: unknown[];
  certifications?: unknown[];
  projects?: unknown[];
  alias?: string;
}

export class PdfService {
  async generateFromCv(cv: CvData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pi = (cv.personalInfo ?? {}) as Record<string, string>;
      doc
        .fontSize(20)
        .text(
          pi.fullName ?? pi.professionalTitle ?? cv.alias ?? 'CV',
          { align: 'center' },
        );
      doc.moveDown(0.5);
      if (pi.email) doc.fontSize(10).text(pi.email, { align: 'center' });
      if (pi.phone) doc.text(pi.phone, { align: 'center' });
      doc.moveDown(1);

      const exp = (cv.experience ?? []) as Array<{
        title?: string;
        company?: string;
        description?: string;
      }>;
      if (exp.length > 0) {
        doc.fontSize(14).text('Experiencia', { underline: true });
        doc.moveDown(0.5);
        exp.forEach((e) => {
          doc
            .fontSize(11)
            .text(`${e.title ?? ''} - ${e.company ?? ''}`);
          if (e.description)
            doc.fontSize(9).text(e.description, { continued: false });
          doc.moveDown(0.3);
        });
        doc.moveDown(0.5);
      }

      const edu = (cv.education ?? []) as Array<{
        degree?: string;
        institution?: string;
      }>;
      if (edu.length > 0) {
        doc.fontSize(14).text('Educación', { underline: true });
        doc.moveDown(0.5);
        edu.forEach((e) => {
          doc
            .fontSize(11)
            .text(`${e.degree ?? ''} - ${e.institution ?? ''}`);
          doc.moveDown(0.3);
        });
        doc.moveDown(0.5);
      }

      const skills = cv.skills ?? {};
      const tech = [...(skills.technical ?? []), ...(skills.soft ?? [])];
      if (tech.length > 0) {
        doc.fontSize(14).text('Habilidades', { underline: true });
        doc.fontSize(10).text(tech.join(', '));
        doc.moveDown(1);
      }

      doc.end();
    });
  }
}

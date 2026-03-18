import { prisma } from '../lib/prisma';

interface FindAllFilters {
  cvId?: string;
  company?: string;
  status?: string;
  from?: string;
  to?: string;
}

export class ApplicationsService {
  private mapToResponse(app: {
    id: string;
    status: string;
    cvId: string | null;
    jobOfferId: string;
    notes: string | null;
    historyEvents: unknown;
    createdAt: Date;
    updatedAt: Date;
    cv: { alias: string } | null;
    jobOffer: { title: string; company: string | null; description: string; sourceUrl: string | null };
  }) {
    return {
      id: app.id,
      status: app.status,
      cvId: app.cvId ?? undefined,
      jobOfferId: app.jobOfferId,
      notes: app.notes ?? undefined,
      historyEvents: (app.historyEvents as Array<{ date: string; event: string }>) ?? [],
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
      jobOffer: {
        company: app.jobOffer.company ?? '',
        role: app.jobOffer.title,
        sourceUrl: app.jobOffer.sourceUrl ?? undefined,
        description: app.jobOffer.description,
      },
      cv: app.cv ? { name: app.cv.alias } : undefined,
    };
  }

  async findAll(userId: string, filters: FindAllFilters) {
    const where: Record<string, unknown> = { userId };

    if (filters.cvId) where.cvId = filters.cvId;
    if (filters.status) where.status = filters.status;
    if (filters.company) {
      where.jobOffer = { company: { contains: filters.company, mode: 'insensitive' } };
    }
    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) (where.createdAt as Record<string, Date>).gte = new Date(filters.from);
      if (filters.to) (where.createdAt as Record<string, Date>).lte = new Date(filters.to);
    }

    const apps = await prisma.application.findMany({
      where,
      include: {
        cv: { select: { alias: true } },
        jobOffer: { select: { title: true, company: true, description: true, sourceUrl: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return apps.map((a) => this.mapToResponse(a));
  }

  async findOne(userId: string, id: string) {
    const app = await prisma.application.findFirst({
      where: { id, userId },
      include: {
        cv: { select: { alias: true } },
        jobOffer: { select: { title: true, company: true, description: true, sourceUrl: true } },
      },
    });
    if (!app) return null;
    return this.mapToResponse(app);
  }

  async create(userId: string, body: { jobOfferId: string; cvId?: string; status?: string }) {
    const app = await prisma.application.create({
      data: {
        userId,
        jobOfferId: body.jobOfferId,
        cvId: body.cvId ?? null,
        status: body.status ?? 'guardado',
      },
      include: {
        cv: { select: { alias: true } },
        jobOffer: { select: { title: true, company: true, description: true, sourceUrl: true } },
      },
    });
    return this.mapToResponse(app);
  }

  async update(userId: string, id: string, body: { status?: string; notes?: string }) {
    const existing = await prisma.application.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;

    const data: Record<string, unknown> = {};
    if (body.status !== undefined) data.status = body.status;
    if (body.notes !== undefined) data.notes = body.notes;

    const app = await prisma.application.update({
      where: { id },
      data,
      include: {
        cv: { select: { alias: true } },
        jobOffer: { select: { title: true, company: true, description: true, sourceUrl: true } },
      },
    });
    return this.mapToResponse(app);
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface FindAllFilters {
  cvId?: string;
  company?: string;
  status?: string;
  from?: string;
  to?: string;
}

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getDefaultUserId(): Promise<string> {
    const defaultEmail = process.env.DEFAULT_USER_EMAIL ?? 'dev@cvlab.local';
    let user = await this.prisma.user.findUnique({
      where: { email: defaultEmail },
    });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: defaultEmail,
          password: process.env.DEFAULT_USER_PASSWORD ?? 'dev-password',
          name: 'Usuario desarrollo',
        },
      });
    }
    return user.id;
  }

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

  async findAll(filters: FindAllFilters) {
    const userId = await this.getDefaultUserId();
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

    const apps = await this.prisma.application.findMany({
      where,
      include: {
        cv: { select: { alias: true } },
        jobOffer: { select: { title: true, company: true, description: true, sourceUrl: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return apps.map(this.mapToResponse);
  }

  async findOne(id: string) {
    const userId = await this.getDefaultUserId();
    const app = await this.prisma.application.findFirst({
      where: { id, userId },
      include: {
        cv: { select: { alias: true } },
        jobOffer: { select: { title: true, company: true, description: true, sourceUrl: true } },
      },
    });
    if (!app) return null;
    return this.mapToResponse(app);
  }

  async create(body: { jobOfferId: string; cvId?: string; status?: string }) {
    const userId = await this.getDefaultUserId();
    const app = await this.prisma.application.create({
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

  async update(id: string, body: { status?: string; notes?: string }) {
    const userId = await this.getDefaultUserId();
    const existing = await this.prisma.application.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;

    const data: Record<string, unknown> = {};
    if (body.status !== undefined) data.status = body.status;
    if (body.notes !== undefined) data.notes = body.notes;

    const app = await this.prisma.application.update({
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

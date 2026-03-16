import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function mapPayloadToDb(payload: Record<string, unknown>) {
  const firstName = (payload.firstName as string) ?? '';
  const lastName = (payload.lastName as string) ?? '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'CV Maestro';
  const professionalTitle = (payload.professionalTitle as string) ?? (payload.position as string) ?? '';
  const alias = professionalTitle || fullName || 'CV';

  const personalInfo = {
    fullName,
    firstName,
    lastName,
    email: (payload.email as string) ?? '',
    phone: '',
    location: (payload.location as string) ?? '',
    linkedin: (payload.linkedIn as string) ?? '',
    github: (payload.github as string) ?? '',
    portfolio: (payload.portfolio as string) ?? '',
    professionalTitle,
    profileSummary: (payload.profileSummary as string) ?? '',
  };

  const skills = payload.skills as Array<{ id: string; name: string; category: string }> | undefined;
  const technical = skills?.filter((s) => s.category === 'technical').map((s) => s.name) ?? [];
  const soft = skills?.filter((s) => s.category === 'soft').map((s) => s.name) ?? [];
  const skillsJson = { technical, soft };

  return {
    alias,
    personalInfo,
    experience: payload.experiences ?? [],
    education: payload.educations ?? payload.education ?? [],
    skills: skillsJson,
    languages: payload.languages ?? [],
    certifications: payload.certifications ?? [],
    projects: [],
  };
}

function mapDbToPayload(cv: {
  id: string;
  alias: string;
  personalInfo: unknown;
  experience: unknown;
  education: unknown;
  skills: unknown;
  languages: unknown;
  certifications: unknown;
  updatedAt: Date;
}) {
  const pi = (cv.personalInfo as Record<string, unknown>) ?? {};
  const skills = (cv.skills as { technical?: string[]; soft?: string[] }) ?? {};
  const techSkills = (skills.technical ?? []).map((name, i) => ({
    id: `sk-${i}`,
    name,
    category: 'technical' as const,
  }));
  const softSkills = (skills.soft ?? []).map((name, i) => ({
    id: `sk-s-${i}`,
    name,
    category: 'soft' as const,
  }));

  return {
    id: cv.id,
    firstName: (pi.firstName as string) ?? '',
    lastName: (pi.lastName as string) ?? '',
    email: (pi.email as string) ?? '',
    position: (pi.professionalTitle as string) ?? '',
    professionalTitle: (pi.professionalTitle as string) ?? '',
    location: (pi.location as string) ?? '',
    linkedIn: (pi.linkedin as string) ?? '',
    github: (pi.github as string) ?? '',
    portfolio: (pi.portfolio as string) ?? '',
    profileSummary: (pi.profileSummary as string) ?? '',
    experiences: (cv.experience as unknown[]) ?? [],
    skills: [...techSkills, ...softSkills],
    educations: (cv.education as unknown[]) ?? [],
    certifications: (cv.certifications as unknown[]) ?? [],
    languages: (cv.languages as unknown[]) ?? [],
    updatedAt: cv.updatedAt.toISOString(),
  };
}

@Injectable()
export class CvService {
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

  async findAll() {
    const userId = await this.getDefaultUserId();
    const cvs = await this.prisma.cv.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return cvs.map((c) => ({
      id: c.id,
      title: c.alias,
      updatedAt: c.updatedAt.toISOString(),
    }));
  }

  async findOne(id: string) {
    const userId = await this.getDefaultUserId();
    const cv = await this.prisma.cv.findFirst({
      where: { id, userId },
    });
    if (!cv) return null;
    return mapDbToPayload(cv);
  }

  async create(payload: Record<string, unknown>) {
    const userId = await this.getDefaultUserId();
    const data = mapPayloadToDb(payload);
    const cv = await this.prisma.cv.create({
      data: {
        userId,
        alias: data.alias,
        personalInfo: data.personalInfo as object,
        experience: data.experience as object,
        education: data.education as object,
        skills: data.skills as object,
        languages: data.languages as object,
        certifications: data.certifications as object,
        projects: data.projects as object,
      },
    });
    return mapDbToPayload(cv);
  }

  async update(id: string, payload: Record<string, unknown>) {
    const userId = await this.getDefaultUserId();
    const existing = await this.prisma.cv.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;

    const data = mapPayloadToDb(payload);
    const cv = await this.prisma.cv.update({
      where: { id },
      data: {
        alias: data.alias,
        personalInfo: data.personalInfo as object,
        experience: data.experience as object,
        education: data.education as object,
        skills: data.skills as object,
        languages: data.languages as object,
        certifications: data.certifications as object,
        projects: data.projects as object,
      },
    });
    return mapDbToPayload(cv);
  }

  async delete(id: string) {
    const userId = await this.getDefaultUserId();
    const existing = await this.prisma.cv.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;
    await this.prisma.cv.delete({ where: { id } });
    return true;
  }
}

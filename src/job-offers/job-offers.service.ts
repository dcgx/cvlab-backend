import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { PrismaService } from '../prisma/prisma.service';
import { CvService } from '../cv/cv.service';

const TECH_KEYWORDS = [
  'javascript', 'typescript', 'react', 'vue', 'angular', 'node', 'python', 'java',
  'sql', 'postgresql', 'mongodb', 'redis', 'aws', 'docker', 'kubernetes', 'git',
  'rest', 'graphql', 'agile', 'scrum', 'ci/cd', 'terraform', 'linux', 'next.js',
  'nuxt', 'nestjs', 'express', 'fastapi', 'django', 'spring', 'prisma', 'tailwind',
];

function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).map((w) => w.replace(/[^a-z0-9#+.-]/g, ''));
  const found = new Set<string>();

  for (const kw of TECH_KEYWORDS) {
    if (lower.includes(kw)) found.add(kw);
  }
  for (const w of words) {
    if (w.length >= 3 && /[a-z]/.test(w) && !/^\d+$/.test(w)) {
      found.add(w);
    }
  }
  return Array.from(found).slice(0, 20);
}

function extractSkills(text: string): string[] {
  const keywords = extractKeywords(text);
  const skills: string[] = [];
  const soft = ['comunicación', 'liderazgo', 'trabajo en equipo', 'resolución de problemas', 'adaptabilidad'];
  const lower = text.toLowerCase();
  for (const s of soft) {
    if (lower.includes(s)) skills.push(s);
  }
  return [...new Set([...skills, ...keywords.slice(0, 10)])];
}

@Injectable()
export class JobOffersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cvService: CvService,
  ) {}

  private async fetchTextFromUrl(url: string): Promise<string> {
    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'CvLab-Bot/1.0' },
      maxRedirects: 3,
      validateStatus: (s: number) => s >= 200 && s < 400,
    });
    const $ = cheerio.load(data);
    $('script, style, nav, footer').remove();
    return $('body').text().replace(/\s+/g, ' ').trim().slice(0, 15000);
  }

  async analyzeAndGenerateCv(userId: string, body: {
    title: string;
    rawText?: string;
    sourceUrl?: string;
  }) {
    let rawText = body.rawText ?? '';
    if (body.sourceUrl && (!rawText || rawText.length < 50)) {
      try {
        rawText = await this.fetchTextFromUrl(body.sourceUrl);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Error desconocido';
        throw new BadRequestException(
          `No se pudo obtener contenido de la URL: ${msg}`,
        );
      }
    }
    const text = rawText;
    const skills = extractSkills(text);
    const technologies = extractKeywords(text).filter((k) =>
      TECH_KEYWORDS.some((t) => k.includes(t) || t.includes(k)),
    );
    const keywords = extractKeywords(text);

    const analysis = {
      skills,
      technologies: technologies.length > 0 ? technologies : keywords.slice(0, 8),
      seniority: undefined as string | undefined,
      role: body.title,
      keywords,
    };

    const jobOffer = await this.prisma.jobOffer.create({
      data: {
        title: body.title,
        description: text.slice(0, 5000),
        sourceUrl: body.sourceUrl ?? null,
        requirements: analysis as object,
        analyzedAt: new Date(),
      },
    });

    const cvs = await this.prisma.cv.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 1,
    });

    let cvId: string;
    if (cvs.length > 0) {
      const baseCv = cvs[0];
      const adaptedCv = await this.prisma.cv.create({
        data: {
          userId,
          alias: `${baseCv.alias} - ${body.title}`,
          personalInfo: baseCv.personalInfo ?? undefined,
          experience: baseCv.experience ?? undefined,
          education: baseCv.education ?? undefined,
          skills: { technical: analysis.technologies, soft: analysis.skills } as object,
          languages: baseCv.languages ?? undefined,
          certifications: baseCv.certifications ?? undefined,
          projects: baseCv.projects ?? undefined,
        },
      });
      await this.prisma.adaptation.create({
        data: {
          baseCvId: baseCv.id,
          jobOfferId: jobOffer.id,
          adaptedCvId: adaptedCv.id,
          changes: analysis as object,
        },
      });
      cvId = adaptedCv.id;
    } else {
      const cvPayload = {
        firstName: '',
        lastName: '',
        email: '',
        position: body.title,
        professionalTitle: body.title,
        location: '',
        linkedIn: '',
        github: '',
        portfolio: '',
        profileSummary: '',
        experiences: [],
        skills: analysis.technologies.map((n) => ({ id: `sk-${n}`, name: n, category: 'technical' })),
        educations: [],
        certifications: [],
        languages: [],
      };
      const created = await this.cvService.create(userId, cvPayload);
      cvId = created.id;
    }

    const application = await this.prisma.application.create({
      data: {
        userId,
        jobOfferId: jobOffer.id,
        cvId,
        status: 'guardado',
      },
    });

    return {
      cvId,
      applicationId: application.id,
      jobOfferId: jobOffer.id,
      analysis: {
        skills: analysis.skills,
        technologies: analysis.technologies,
        seniority: analysis.seniority,
        role: analysis.role,
        keywords: analysis.keywords,
      },
    };
  }
}

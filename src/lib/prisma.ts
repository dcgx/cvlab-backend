import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function connectPrisma() {
  try {
    await prisma.$connect();
  } catch {
    // App sigue levantada; GET /health reportará database: 'disconnected'
  }
}

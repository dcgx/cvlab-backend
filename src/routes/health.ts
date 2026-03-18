import { Elysia } from 'elysia';
import { prisma } from '../lib/prisma';

export const healthRoutes = new Elysia().get('/health', async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', database: 'connected' };
  } catch {
    return { status: 'ok', database: 'disconnected' };
  }
});

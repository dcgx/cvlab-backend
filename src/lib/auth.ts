import { Elysia } from 'elysia';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { prisma } from './prisma';

let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  if (!supabase) supabase = createClient(url, anonKey);
  return supabase;
}

async function getDefaultUserId(): Promise<string> {
  const defaultEmail = process.env.DEFAULT_USER_EMAIL ?? 'dev@cvlab.local';
  let user = await prisma.user.findUnique({
    where: { email: defaultEmail },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: defaultEmail,
        password: process.env.DEFAULT_USER_PASSWORD ?? 'dev-password',
        name: 'Usuario desarrollo',
      },
    });
  }
  return user.id;
}

/**
 * Middleware que resuelve userId desde el JWT de Supabase.
 * Si no hay token o falla, usa usuario por defecto (desarrollo).
 */
export const optionalAuth = new Elysia({ name: 'optional-auth' }).derive(
  { as: 'scoped' },
  async ({ request }) => {
    const authHeader = request.headers?.get?.('authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : undefined;

    if (!token) {
      return { userId: await getDefaultUserId() };
    }

    const client = getSupabase();
    if (!client) {
      return { userId: await getDefaultUserId() };
    }

    try {
      const {
        data: { user },
        error,
      } = await client.auth.getUser(token);

      if (error || !user) {
        return { userId: await getDefaultUserId() };
      }

      const email = user.email ?? user.user_metadata?.email ?? '';
      const name = user.user_metadata?.name ?? user.user_metadata?.full_name ?? null;

      const dbUser = await prisma.user.upsert({
        where: { id: user.id },
        create: {
          id: user.id,
          email: email || `user-${user.id}@supabase.local`,
          name,
          password: '',
        },
        update: { email: email || undefined, name: name ?? undefined },
      });

      return { userId: dbUser.id };
    } catch {
      return { userId: await getDefaultUserId() };
    }
  },
);

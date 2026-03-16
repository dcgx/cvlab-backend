import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Guard que intenta validar el JWT de Supabase pero no falla si no hay token.
 * Útil para rutas que funcionan con o sin auth (ej. desarrollo con usuario por defecto).
 */
@Injectable()
export class OptionalSupabaseAuthGuard implements CanActivate {
  private supabase: SupabaseClient | null = null;

  constructor(private readonly prisma: PrismaService) {}

  private getSupabase(): SupabaseClient | null {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    if (!url || !anonKey) return null;
    if (!this.supabase) {
      this.supabase = createClient(url, anonKey);
    }
    return this.supabase;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : undefined;

    if (!token) {
      request.userId = await this.getDefaultUserId();
      return true;
    }

    const supabase = this.getSupabase();
    if (!supabase) {
      request.userId = await this.getDefaultUserId();
      return true;
    }

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        request.userId = await this.getDefaultUserId();
        return true;
      }

      const userId = user.id;
      const email = user.email ?? user.user_metadata?.email ?? '';
      const name = user.user_metadata?.name ?? user.user_metadata?.full_name ?? null;

      const dbUser = await this.prisma.user.upsert({
        where: { id: userId },
        create: {
          id: userId,
          email: email || `user-${userId}@supabase.local`,
          name,
          password: '', // OAuth user, no password
        },
        update: { email: email || undefined, name: name ?? undefined },
      });

      request.userId = dbUser.id;
      request.user = dbUser;
      return true;
    } catch {
      request.userId = await this.getDefaultUserId();
      return true;
    }
  }

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
}

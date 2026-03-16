import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private supabase: SupabaseClient | null = null;

  constructor(private readonly prisma: PrismaService) {}

  private getSupabase(): SupabaseClient {
    if (!this.supabase) {
      const url = process.env.SUPABASE_URL;
      const anonKey = process.env.SUPABASE_ANON_KEY;
      if (!url || !anonKey) {
        throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set');
      }
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
      throw new UnauthorizedException('Token requerido');
    }

    try {
      const supabase = this.getSupabase();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        throw new UnauthorizedException('Token inválido o expirado');
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
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException('Error al validar sesión');
    }
  }
}

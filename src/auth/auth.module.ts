import { Module } from '@nestjs/common';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { OptionalSupabaseAuthGuard } from './optional-supabase-auth.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SupabaseAuthGuard, OptionalSupabaseAuthGuard],
  exports: [SupabaseAuthGuard, OptionalSupabaseAuthGuard],
})
export class AuthModule {}

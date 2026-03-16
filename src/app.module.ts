import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { CvModule } from './cv/cv.module';
import { ApplicationsModule } from './applications/applications.module';
import { JobOffersModule } from './job-offers/job-offers.module';

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    AuthModule,
    CvModule,
    ApplicationsModule,
    JobOffersModule,
  ],
})
export class AppModule {}

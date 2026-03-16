import { Module } from '@nestjs/common';
import { JobOffersController } from './job-offers.controller';
import { JobOffersService } from './job-offers.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CvModule } from '../cv/cv.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, CvModule, AuthModule],
  controllers: [JobOffersController],
  providers: [JobOffersService],
})
export class JobOffersModule {}

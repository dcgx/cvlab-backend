import { Module } from '@nestjs/common';
import { JobOffersController } from './job-offers.controller';
import { JobOffersService } from './job-offers.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CvModule } from '../cv/cv.module';

@Module({
  imports: [PrismaModule, CvModule],
  controllers: [JobOffersController],
  providers: [JobOffersService],
})
export class JobOffersModule {}

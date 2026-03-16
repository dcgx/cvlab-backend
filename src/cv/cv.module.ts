import { Module } from '@nestjs/common';
import { CvController } from './cv.controller';
import { CvService } from './cv.service';
import { PdfModule } from '../pdf/pdf.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, PdfModule, AuthModule],
  controllers: [CvController],
  providers: [CvService],
})
export class CvModule {}

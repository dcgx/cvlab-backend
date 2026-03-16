import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Res,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { CvService } from './cv.service';
import { OptionalSupabaseAuthGuard } from '../auth/optional-supabase-auth.guard';
import { CurrentUserId } from '../auth/current-user.decorator';

@Controller('cvs')
@UseGuards(OptionalSupabaseAuthGuard)
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Get()
  async list(@CurrentUserId() userId: string) {
    return this.cvService.findAll(userId);
  }

  @Get(':id/pdf')
  async getPdf(@CurrentUserId() userId: string, @Param('id') id: string, @Res() res: Response) {
    const buffer = await this.cvService.generatePdfBuffer(userId, id);
    if (!buffer) throw new NotFoundException('CV no encontrado');
    const filename = `cv-${id}.pdf`;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get(':id')
  async get(@CurrentUserId() userId: string, @Param('id') id: string) {
    const cv = await this.cvService.findOne(userId, id);
    if (!cv) throw new NotFoundException('CV no encontrado');
    return cv;
  }

  @Post()
  async create(@CurrentUserId() userId: string, @Body() body: Record<string, unknown>) {
    return this.cvService.create(userId, body);
  }

  @Patch(':id')
  async update(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    const cv = await this.cvService.update(userId, id, body);
    if (!cv) throw new NotFoundException('CV no encontrado');
    return cv;
  }

  @Delete(':id')
  async delete(@CurrentUserId() userId: string, @Param('id') id: string) {
    const deleted = await this.cvService.delete(userId, id);
    if (!deleted) throw new NotFoundException('CV no encontrado');
    return { success: true };
  }
}

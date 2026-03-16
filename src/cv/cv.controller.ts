import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { CvService } from './cv.service';

@Controller('cvs')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Get()
  async list() {
    return this.cvService.findAll();
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const cv = await this.cvService.findOne(id);
    if (!cv) throw new NotFoundException('CV no encontrado');
    return cv;
  }

  @Post()
  async create(@Body() body: Record<string, unknown>) {
    return this.cvService.create(body);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    const cv = await this.cvService.update(id, body);
    if (!cv) throw new NotFoundException('CV no encontrado');
    return cv;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deleted = await this.cvService.delete(id);
    if (!deleted) throw new NotFoundException('CV no encontrado');
    return { success: true };
  }
}

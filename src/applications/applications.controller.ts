import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  async list(
    @Query('cvId') cvId?: string,
    @Query('company') company?: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.applicationsService.findAll({
      cvId,
      company,
      status,
      from,
      to,
    });
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const app = await this.applicationsService.findOne(id);
    if (!app) throw new NotFoundException('Postulación no encontrada');
    return app;
  }

  @Post()
  async create(@Body() body: { jobOfferId: string; cvId?: string; status?: string }) {
    return this.applicationsService.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { status?: string; notes?: string },
  ) {
    const app = await this.applicationsService.update(id, body);
    if (!app) throw new NotFoundException('Postulación no encontrada');
    return app;
  }
}

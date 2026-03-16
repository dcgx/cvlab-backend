import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { OptionalSupabaseAuthGuard } from '../auth/optional-supabase-auth.guard';
import { CurrentUserId } from '../auth/current-user.decorator';

@Controller('applications')
@UseGuards(OptionalSupabaseAuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  async list(
    @CurrentUserId() userId: string,
    @Query('cvId') cvId?: string,
    @Query('company') company?: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.applicationsService.findAll(userId, {
      cvId,
      company,
      status,
      from,
      to,
    });
  }

  @Get(':id')
  async get(@CurrentUserId() userId: string, @Param('id') id: string) {
    const app = await this.applicationsService.findOne(userId, id);
    if (!app) throw new NotFoundException('Postulación no encontrada');
    return app;
  }

  @Post()
  async create(
    @CurrentUserId() userId: string,
    @Body() body: { jobOfferId: string; cvId?: string; status?: string },
  ) {
    return this.applicationsService.create(userId, body);
  }

  @Patch(':id')
  async update(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() body: { status?: string; notes?: string },
  ) {
    const app = await this.applicationsService.update(userId, id, body);
    if (!app) throw new NotFoundException('Postulación no encontrada');
    return app;
  }
}

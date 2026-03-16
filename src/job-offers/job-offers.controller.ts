import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JobOffersService } from './job-offers.service';
import { AnalyzeAndGenerateDto } from './dto/analyze-and-generate.dto';
import { OptionalSupabaseAuthGuard } from '../auth/optional-supabase-auth.guard';
import { CurrentUserId } from '../auth/current-user.decorator';

@Controller('job-offers')
@UseGuards(OptionalSupabaseAuthGuard)
export class JobOffersController {
  constructor(private readonly jobOffersService: JobOffersService) {}

  @Post('analyze-and-generate-cv')
  async analyzeAndGenerateCv(
    @CurrentUserId() userId: string,
    @Body() body: AnalyzeAndGenerateDto,
  ) {
    return this.jobOffersService.analyzeAndGenerateCv(userId, body);
  }
}

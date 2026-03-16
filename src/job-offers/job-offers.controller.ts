import { Controller, Post, Body } from '@nestjs/common';
import { JobOffersService } from './job-offers.service';

@Controller('job-offers')
export class JobOffersController {
  constructor(private readonly jobOffersService: JobOffersService) {}

  @Post('analyze-and-generate-cv')
  async analyzeAndGenerateCv(
    @Body() body: { title: string; rawText: string; sourceUrl?: string },
  ) {
    return this.jobOffersService.analyzeAndGenerateCv(body);
  }
}

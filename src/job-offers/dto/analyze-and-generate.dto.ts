import {
  IsString,
  IsOptional,
  IsUrl,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class AnalyzeAndGenerateDto {
  @IsString()
  @MinLength(1)
  title: string;

  @ValidateIf((o) => !o.sourceUrl)
  @IsString()
  @MinLength(10, { message: 'rawText o sourceUrl es requerido' })
  rawText?: string;

  @IsOptional()
  @IsUrl()
  sourceUrl?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class ResumeReviewDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(20000)
  resumeText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  resumeUrl?: string;
}

export class CoverLetterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(8000)
  jobDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20000)
  resumeText?: string;
}

export class JobMatchDto {
  @ApiPropertyOptional({
    description: 'Optional resume/profile snippet override',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20000)
  profileText?: string;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number;
}

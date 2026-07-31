import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsISO8601,
  IsMongoId,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { InterviewStatus } from '../../../common/enums/domain.enum';

export class CreateInterviewDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  applicationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  jobId?: string;

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  @IsISO8601()
  scheduledAt!: string;

  @ApiPropertyOptional({ example: 'Africa/Lagos' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_tld: false })
  meetingLink?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  recruiterName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  interviewType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  panelists?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateInterviewDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  scheduledAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_tld: false })
  meetingLink?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  recruiterName?: string;

  @ApiPropertyOptional({ enum: InterviewStatus })
  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

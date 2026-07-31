import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class ExperienceDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() company?: string;
  @IsOptional() @IsString() employmentType?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() @IsBoolean() currentlyWorking?: boolean;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() achievements?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) technologies?: string[];
}

class EducationDto {
  @IsOptional() @IsString() school?: string;
  @IsOptional() @IsString() degree?: string;
  @IsOptional() @IsString() field?: string;
  @IsOptional() @IsString() grade?: string;
  @IsOptional() @IsString() year?: string;
  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() @IsString() achievements?: string;
}

class LanguageDto {
  @IsOptional() @IsString() language?: string;
  @IsOptional() @IsString() speaking?: string;
  @IsOptional() @IsString() writing?: string;
  @IsOptional() @IsString() reading?: string;
  @IsOptional() @IsString() listening?: string;
}

class CertificateDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() organization?: string;
  @IsOptional() @IsString() issueDate?: string;
  @IsOptional() @IsString() expiryDate?: string;
  @IsOptional() @IsString() credentialUrl?: string;
  @IsOptional() @IsString() credentialId?: string;
  @IsOptional() @IsString() fileUrl?: string;
}

class SkillItemDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() level?: string;
}

class CareerGoalsDto {
  @IsOptional() @IsString() desiredRole?: string;
  @IsOptional() @IsString() targetSalary?: string;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredCountries?: string[];
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredCompanies?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) industries?: string[];
  @IsOptional() @IsString() careerObjectives?: string;
  @IsOptional() @IsString() learningGoals?: string;
}

export class UpdateSeekerProfileDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillItemDto)
  skillItems?: SkillItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceDto)
  experience?: ExperienceDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EducationDto)
  education?: EducationDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LanguageDto)
  languages?: LanguageDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificateDto)
  certificates?: CertificateDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  portfolioLinks?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  portfolioScreenshots?: string[];

  @ApiPropertyOptional({ enum: ['PRIVATE', 'EMPLOYERS', 'PUBLIC'] })
  @IsOptional()
  @IsIn(['PRIVATE', 'EMPLOYERS', 'PUBLIC'])
  visibility?: 'PRIVATE' | 'EMPLOYERS' | 'PUBLIC';

  @ApiPropertyOptional()
  @IsOptional()
  cvJson?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employmentStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  yearsOfExperience?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preferredSalary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preferredJobType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preferredTimezone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preferredCountry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preferredIndustry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentJobTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn([
    '',
    'AVAILABLE_IMMEDIATELY',
    'OPEN_TO_WORK',
    'NOT_LOOKING',
    'AVAILABLE_NEXT_MONTH',
  ])
  availabilityStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => CareerGoalsDto)
  careerGoals?: CareerGoalsDto;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningBookmarks?: string[];
}

export class UpdateJobAlertPrefsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['daily', 'weekly', 'instant'])
  frequency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  salaryMin?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  workplaceTypes?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  experience?: string;
}

export class UpdateSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  headline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nationality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  lastName?: string;
}

export class ToggleLearningBookmarkDto {
  @ApiProperty()
  @IsMongoId()
  itemId!: string;
}

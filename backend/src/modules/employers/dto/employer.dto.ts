import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpsertEmployerDto {
  @ApiPropertyOptional({ example: 'Talent Lead' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;
}

export class UpdateEmployerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

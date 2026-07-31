import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export class TrackReferralDto {
  @ApiProperty({ example: 'NJ1A2BCD34' })
  @IsString()
  code!: string;

  @ApiProperty({ enum: ['click', 'register'] })
  @IsEnum(['click', 'register'])
  event!: 'click' | 'register';
}

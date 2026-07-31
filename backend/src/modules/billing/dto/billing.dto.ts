import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCheckoutDto {
  @ApiProperty({ enum: ['SUBSCRIPTION', 'FEATURED_JOB', 'SPONSORED_JOB'] })
  @IsEnum(['SUBSCRIPTION', 'FEATURED_JOB', 'SPONSORED_JOB'])
  purpose!: 'SUBSCRIPTION' | 'FEATURED_JOB' | 'SPONSORED_JOB';

  @ApiPropertyOptional({ example: 'EMPLOYER_PRO' })
  @IsOptional()
  @IsString()
  planCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  jobId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ enum: ['mock', 'stripe', 'paystack', 'flutterwave'] })
  @IsOptional()
  @IsString()
  provider?: string;
}

export class ValidateCouponDto {
  @ApiProperty()
  @IsString()
  code!: string;
}

export class CreateRefundDto {
  @ApiProperty()
  @IsMongoId()
  transactionId!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  reason!: string;
}

export class ReviewRefundDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsEnum(['APPROVED', 'REJECTED'])
  status!: 'APPROVED' | 'REJECTED';
}

export class WithdrawWalletDto {
  @ApiProperty({ example: 50 })
  @IsNumber()
  @IsPositive()
  amount!: number;
}

export class CreateCouponDto {
  @ApiProperty()
  @IsString()
  code!: string;

  @ApiPropertyOptional()
  @IsOptional()
  percentOff?: number;

  @ApiPropertyOptional()
  @IsOptional()
  amountOff?: number;
}

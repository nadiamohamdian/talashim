import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KycStatus } from '@/generated/prisma';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewKycDto {
  @ApiProperty({ enum: [KycStatus.APPROVED, KycStatus.REJECTED] })
  @IsEnum(KycStatus)
  status!: KycStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reviewNote?: string;
}

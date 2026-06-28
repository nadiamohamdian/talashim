import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WalletAssetType } from '@/generated/prisma';
import { IsEnum, IsIn, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class AdjustUserWalletDto {
  @ApiProperty()
  @IsUUID()
  userId!: string;

  @ApiProperty({ enum: WalletAssetType })
  @IsEnum(WalletAssetType)
  assetType!: WalletAssetType;

  @ApiProperty({ enum: ['CREDIT', 'DEBIT'], description: 'CREDIT = charge, DEBIT = discharge' })
  @IsIn(['CREDIT', 'DEBIT'])
  direction!: 'CREDIT' | 'DEBIT';

  @ApiProperty({ description: 'Positive amount in toman (RIAL) or grams (GOLD)' })
  @IsString()
  @MinLength(1)
  @MaxLength(24)
  amount!: string;

  @ApiProperty({ description: 'Reason recorded in audit log' })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  idempotencyKey?: string;
}

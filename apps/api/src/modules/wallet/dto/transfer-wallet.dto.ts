import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumberString, IsOptional, IsString, MinLength } from 'class-validator';
import { WalletAssetType } from '@/generated/prisma';

export class TransferWalletDto {
  @ApiProperty({ example: 'cluser123' })
  @IsString()
  @MinLength(3)
  userId!: string;

  @ApiProperty({ enum: WalletAssetType })
  @IsEnum(WalletAssetType)
  assetType!: WalletAssetType;

  @ApiProperty({ example: '500000' })
  @IsNumberString()
  amount!: string;

  @ApiProperty({ example: 'cluser456' })
  @IsString()
  @MinLength(3)
  recipientUserId!: string;

  @ApiProperty({ example: 'transfer-001' })
  @IsString()
  @MinLength(8)
  idempotencyKey!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

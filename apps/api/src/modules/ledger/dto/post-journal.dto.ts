import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumberString, IsString, MinLength } from 'class-validator';
import { LedgerSide, WalletAssetType } from '@/generated/prisma';

export class PostJournalLineDto {
  @ApiProperty({ example: 'PLATFORM_CASH_RIAL' })
  @IsString()
  @MinLength(3)
  accountCode!: string;

  @ApiProperty({ enum: LedgerSide })
  @IsEnum(LedgerSide)
  side!: LedgerSide;

  @ApiProperty({ enum: WalletAssetType })
  @IsEnum(WalletAssetType)
  assetType!: WalletAssetType;

  @ApiProperty({ example: '1000000' })
  @IsNumberString()
  amount!: string;
}

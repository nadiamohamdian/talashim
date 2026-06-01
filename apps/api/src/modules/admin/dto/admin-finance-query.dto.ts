import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  LedgerAccountCategory,
  LedgerSide,
  WalletAssetType,
  WalletTransactionType,
} from '@/generated/prisma';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './admin-query.dto';

export class AdminLedgerEntriesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accountCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({ enum: WalletAssetType })
  @IsOptional()
  @IsEnum(WalletAssetType)
  assetType?: WalletAssetType;

  @ApiPropertyOptional({ enum: LedgerSide })
  @IsOptional()
  @IsEnum(LedgerSide)
  side?: LedgerSide;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string;
}

export class AdminLedgerAccountsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: LedgerAccountCategory })
  @IsOptional()
  @IsEnum(LedgerAccountCategory)
  category?: LedgerAccountCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;
}

export class AdminAccountingQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: LedgerAccountCategory })
  @IsOptional()
  @IsEnum(LedgerAccountCategory)
  category?: LedgerAccountCategory;
}

export class AdminFinanceReportsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ enum: WalletTransactionType })
  @IsOptional()
  @IsEnum(WalletTransactionType)
  type?: WalletTransactionType;
}

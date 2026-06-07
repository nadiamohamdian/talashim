import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  KycStatus,
  PaymentStatus,
  Role,
  GoldTradeSide,
  WalletTransactionStatus,
  WalletTransactionType,
} from '@/generated/prisma';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { normalizeOptionalInt } from '@/common/dto/normalize-query-int';

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => normalizeOptionalInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Transform(({ value }) => normalizeOptionalInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class AdminUsersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ description: 'Exclude CUSTOMER role' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  staffOnly?: boolean;
}

export class AdminKycQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: KycStatus })
  @IsOptional()
  @IsEnum(KycStatus)
  status?: KycStatus;
}

export class AdminWalletTxQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: WalletTransactionType })
  @IsOptional()
  @IsEnum(WalletTransactionType)
  type?: WalletTransactionType;

  @ApiPropertyOptional({ enum: WalletTransactionStatus })
  @IsOptional()
  @IsEnum(WalletTransactionStatus)
  status?: WalletTransactionStatus;

  @ApiPropertyOptional({ description: 'Only wallet deposit requests with uploaded receipt' })
  @IsOptional()
  @IsString()
  hasReceipt?: string;

  @ApiPropertyOptional({ description: 'Only wallet withdrawal requests with destination IBAN' })
  @IsOptional()
  @IsString()
  hasWithdrawalRequest?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;
}

export class AdminPaymentReceiptQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}

export class AdminTradeQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: GoldTradeSide })
  @IsOptional()
  @IsEnum(GoldTradeSide)
  side?: GoldTradeSide;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;
}

export class AdminAuditQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ['platform', 'wallet', 'trade'] })
  @IsOptional()
  @IsString()
  source?: 'platform' | 'wallet' | 'trade';
}

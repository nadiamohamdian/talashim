import { ApiPropertyOptional } from '@nestjs/swagger';
import { KycStatus, Role, GoldTradeSide, WalletTransactionType } from '@/generated/prisma';
import { Type } from 'class-transformer';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;
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

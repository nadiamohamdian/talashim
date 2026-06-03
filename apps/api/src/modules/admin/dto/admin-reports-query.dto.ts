import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  GoldTradeSide,
  GoldTradeStatus,
  OrderStatus,
  ProductCategory,
  Role,
  WalletTransactionType,
} from '@/generated/prisma';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationQueryDto } from './admin-query.dto';

export class ReportDateRangeQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsISO8601()
  from?: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.999Z' })
  @IsOptional()
  @IsISO8601()
  to?: string;
}

export class SalesReportQueryDto extends ReportDateRangeQueryDto {
  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}

export class InventoryReportQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ProductCategory })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  lowStockOnly?: boolean;
}

export class UsersReportQueryDto extends ReportDateRangeQueryDto {
  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

export class TradingReportQueryDto extends ReportDateRangeQueryDto {
  @ApiPropertyOptional({ enum: GoldTradeSide })
  @IsOptional()
  @IsEnum(GoldTradeSide)
  side?: GoldTradeSide;

  @ApiPropertyOptional({ enum: GoldTradeStatus })
  @IsOptional()
  @IsEnum(GoldTradeStatus)
  status?: GoldTradeStatus;
}

export class FinancialReportQueryDto extends ReportDateRangeQueryDto {
  @ApiPropertyOptional({ enum: WalletTransactionType })
  @IsOptional()
  @IsEnum(WalletTransactionType)
  type?: WalletTransactionType;
}

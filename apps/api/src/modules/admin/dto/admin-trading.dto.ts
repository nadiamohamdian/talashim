import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GoldTradeSide, GoldTradeStatus } from '@/generated/prisma';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { PaginationQueryDto } from './admin-query.dto';

export class AdminTradingOrdersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: GoldTradeSide })
  @IsOptional()
  @IsEnum(GoldTradeSide)
  side?: GoldTradeSide;

  @ApiPropertyOptional({ enum: GoldTradeStatus })
  @IsOptional()
  @IsEnum(GoldTradeStatus)
  status?: GoldTradeStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string;
}

export class AdminCancelTradeOrderDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  reason!: string;
}

export class AdminTradingReportQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ enum: GoldTradeSide })
  @IsOptional()
  @IsEnum(GoldTradeSide)
  side?: GoldTradeSide;

  @ApiPropertyOptional({ enum: GoldTradeStatus })
  @IsOptional()
  @IsEnum(GoldTradeStatus)
  status?: GoldTradeStatus;
}

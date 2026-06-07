import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { emptyStringToUndefined } from '@/common/dto/empty-string';
import { PriceHistoryQueryDto } from '@/modules/pricing/dto/price-history-query.dto';
import { PaginationQueryDto } from './admin-query.dto';

export class AdminPriceHistoryQueryDto extends PriceHistoryQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string;
}

export class UpdatePricingMarginsDto {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(50)
  spreadPercent!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  tradeCommissionPercent!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  defaultMakingFeePercent!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(5_000)
  @Max(600_000)
  refreshIntervalMs!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  brsEnabled?: boolean;
}

export class UpsertGoldPriceOverrideDto {
  @ApiPropertyOptional({ default: 'XAU-IRR' })
  @IsOptional()
  @IsString()
  symbol?: string;

  @ApiPropertyOptional({ default: 18 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  karat?: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pricePerGram!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(emptyStringToUndefined)
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  buyPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(emptyStringToUndefined)
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  sellPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  @MinLength(2)
  reason?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class AdminOverridesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  activeOnly?: boolean;
}

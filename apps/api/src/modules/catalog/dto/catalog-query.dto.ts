import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export const CATALOG_SORT_KEYS = [
  'best-selling',
  'discounts',
  'price-desc',
  'price-asc',
  'new-collection',
] as const;

export type CatalogSortKey = (typeof CATALOG_SORT_KEYS)[number];

export class CatalogQueryDto {
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 12;

  @ApiPropertyOptional({ description: 'When true, only products with an active discount' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === true || value === 1 || value === '1' || value === 'true') {
      return true;
    }
    if (value === false || value === 0 || value === '0' || value === 'false') {
      return false;
    }
    return undefined;
  })
  @IsBoolean()
  sale?: boolean;

  @ApiPropertyOptional({ description: 'Minimum final price in Toman (inclusive)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum final price in Toman (inclusive)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Minimum weight in grams (inclusive)' })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minWeight?: number;

  @ApiPropertyOptional({ description: 'Maximum weight in grams (inclusive)' })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  maxWeight?: number;

  @ApiPropertyOptional({
    description: 'Sort key: best-selling | discounts | price-desc | price-asc | new-collection',
    enum: CATALOG_SORT_KEYS,
  })
  @IsOptional()
  @IsString()
  @IsIn(CATALOG_SORT_KEYS)
  sort?: CatalogSortKey;
}

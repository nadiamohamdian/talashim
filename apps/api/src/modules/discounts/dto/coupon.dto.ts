import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { DiscountType, ProductCategory } from '@/generated/prisma';

export class CouponRuleDto {
  @ApiProperty({ enum: DiscountType })
  @IsEnum(DiscountType)
  discountType!: DiscountType;

  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountValue!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  minimumOrderAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  maximumDiscountAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimitTotal?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimitPerUser?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFirstPurchaseOnly?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  allowWithOtherCoupons?: boolean;
}

export class CouponScopeDto {
  @ApiPropertyOptional({ type: [String], enum: ProductCategory })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsEnum(ProductCategory, { each: true })
  applicableCategories?: ProductCategory[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1000)
  @IsString({ each: true })
  applicableProducts?: string[];

  @ApiPropertyOptional({ type: [String], enum: ProductCategory })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsEnum(ProductCategory, { each: true })
  excludedCategories?: ProductCategory[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1000)
  @IsString({ each: true })
  excludedProducts?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1000)
  @IsString({ each: true })
  applicableUsers?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1000)
  @IsString({ each: true })
  excludedUsers?: string[];

  @ApiPropertyOptional({ maxLength: 50 })
  @IsOptional()
  @IsString()
  customerGroup?: string;
}

export class CreateCouponDto extends CouponRuleDto implements CouponScopeDto {
  @ApiProperty({ example: 'GOLD20' })
  @IsString()
  @Matches(/^[A-Z0-9_-]{3,32}$/)
  code!: string;

  @ApiProperty()
  @IsString()
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ type: [String], enum: ProductCategory })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsEnum(ProductCategory, { each: true })
  applicableCategories?: ProductCategory[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1000)
  @IsString({ each: true })
  applicableProducts?: string[];

  @ApiPropertyOptional({ type: [String], enum: ProductCategory })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsEnum(ProductCategory, { each: true })
  excludedCategories?: ProductCategory[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1000)
  @IsString({ each: true })
  excludedProducts?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1000)
  @IsString({ each: true })
  applicableUsers?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1000)
  @IsString({ each: true })
  excludedUsers?: string[];

  @ApiPropertyOptional({ maxLength: 50 })
  @IsOptional()
  @IsString()
  customerGroup?: string;
}

export class UpdateCouponDto extends PartialType(CreateCouponDto) {}

export class CouponQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: DiscountType })
  @IsOptional()
  @IsEnum(DiscountType)
  type?: DiscountType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ValidateCouponDto {
  @ApiProperty()
  @IsString()
  code!: string;

  @ApiProperty()
  @IsString()
  cartId!: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductReviewStatus } from '@/generated/prisma';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PaginationQueryDto } from './admin-query.dto';

export class AdminBlogPostReviewsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ProductReviewStatus })
  @IsOptional()
  @IsEnum(ProductReviewStatus)
  status?: ProductReviewStatus;

  @ApiPropertyOptional({ description: 'Search in body, phone, blog post title or slug' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'When true, groups reviews by blog post',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    if (value === true || value === 'true' || value === '1') {
      return true;
    }
    if (value === false || value === 'false' || value === '0') {
      return false;
    }
    return undefined;
  })
  @IsBoolean()
  groupByBlogPost?: boolean;
}

export class ReviewAdminBlogPostReviewDto {
  @ApiProperty({ enum: [ProductReviewStatus.APPROVED, ProductReviewStatus.REJECTED] })
  @IsIn([ProductReviewStatus.APPROVED, ProductReviewStatus.REJECTED])
  status!: ProductReviewStatus;
}

export class UpdateAdminBlogPostReviewDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  body?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  authorName?: string;

  @ApiPropertyOptional({ enum: ProductReviewStatus })
  @IsOptional()
  @IsEnum(ProductReviewStatus)
  status?: ProductReviewStatus;
}

export class CreateAdminBlogPostReviewDto {
  @ApiProperty({ description: 'Blog post slug' })
  @IsString()
  @MinLength(2)
  blogPostSlug!: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  body!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  authorName?: string;

  @ApiPropertyOptional({ description: '11-digit mobile; optional for admin-created reviews' })
  @IsOptional()
  @IsString()
  @MinLength(11)
  @MaxLength(11)
  phone?: string;

  @ApiPropertyOptional({ enum: ProductReviewStatus, default: ProductReviewStatus.APPROVED })
  @IsOptional()
  @IsEnum(ProductReviewStatus)
  status?: ProductReviewStatus;
}

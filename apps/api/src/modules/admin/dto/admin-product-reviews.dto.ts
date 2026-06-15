import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductReviewStatus } from '@/generated/prisma';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './admin-query.dto';

export class AdminProductReviewsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ProductReviewStatus })
  @IsOptional()
  @IsEnum(ProductReviewStatus)
  status?: ProductReviewStatus;

  @ApiPropertyOptional({ description: 'Search in body, phone, product title or slug' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class ReviewAdminProductReviewDto {
  @ApiProperty({ enum: [ProductReviewStatus.APPROVED, ProductReviewStatus.REJECTED] })
  @IsIn([ProductReviewStatus.APPROVED, ProductReviewStatus.REJECTED])
  status!: ProductReviewStatus;
}

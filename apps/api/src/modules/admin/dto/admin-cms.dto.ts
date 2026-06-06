import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CmsBannerPlacement, CmsBannerStatus } from '@/generated/prisma';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { PaginationQueryDto } from './admin-query.dto';

export class AdminBlogQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Category slug e.g. guides, faq' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  published?: 'true' | 'false' | 'all';
}

export class UpsertFaqPostDto {
  @ApiProperty({ description: 'Question text' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  slug!: string;

  @ApiProperty({ description: 'Answer HTML' })
  @IsString()
  @MinLength(2)
  content!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(400)
  excerpt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true }, { message: 'coverImageUrl must be a valid URL' })
  coverImageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class UpsertBlogPostDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  slug!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(400)
  excerpt!: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  content!: string;

  @ApiProperty()
  @IsString()
  @IsUrl({ require_protocol: true }, { message: 'coverImageUrl must be a valid URL' })
  coverImageUrl!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class AdminBannersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: CmsBannerStatus })
  @IsOptional()
  @IsEnum(CmsBannerStatus)
  status?: CmsBannerStatus;

  @ApiPropertyOptional({ enum: CmsBannerPlacement })
  @IsOptional()
  @IsEnum(CmsBannerPlacement)
  placement?: CmsBannerPlacement;
}

export class UpsertCmsBannerDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiProperty()
  @IsString()
  @IsUrl({ require_protocol: true })
  imageUrl!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  linkUrl?: string;

  @ApiPropertyOptional({ enum: CmsBannerPlacement })
  @IsOptional()
  @IsEnum(CmsBannerPlacement)
  placement?: CmsBannerPlacement;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ enum: CmsBannerStatus })
  @IsOptional()
  @IsEnum(CmsBannerStatus)
  status?: CmsBannerStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endsAt?: string;
}

export class UpdateCmsHomepageDto {
  @ApiProperty()
  @IsObject()
  hero!: Record<string, unknown>;

  @ApiProperty()
  @IsObject()
  sections!: Record<string, unknown>;
}

export class AdminStaticPagesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  published?: 'true' | 'false' | 'all';
}

export class UpsertCmsStaticPageDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  slug!: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  content!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateCmsSeoDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  siteTitle!: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  siteDescription!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  defaultOgImageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  robotsIndex?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  googleAnalyticsId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  extraMeta?: Record<string, string>;
}

export class AdminMediaQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mimeType?: string;
}

export class RegisterMediaAssetDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  filename!: string;

  @ApiProperty()
  @IsString()
  @IsUrl({ require_protocol: true })
  url!: string;

  @ApiProperty()
  @IsString()
  mimeType!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(50_000_000)
  sizeBytes!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  alt?: string;

  @ApiPropertyOptional({ default: 'general' })
  @IsOptional()
  @IsString()
  folder?: string;
}

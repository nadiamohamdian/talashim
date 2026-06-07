import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { normalizeOptionalInt } from '@/common/dto/normalize-query-int';

export class BlogQueryDto {
  @IsOptional()
  @Transform(({ value }) => normalizeOptionalInt(value))
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  category?: string;

  /** Accepted for client compatibility — ignored by the blog list endpoint. */
  @IsOptional()
  @Transform(({ value }) => normalizeOptionalInt(value))
  @IsInt()
  @Min(1)
  page?: number;
}

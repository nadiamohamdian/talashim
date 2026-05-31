import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class PriceHistoryQueryDto {
  @ApiPropertyOptional({ default: 'XAU-IRR' })
  @IsOptional()
  @IsString()
  symbol?: string = 'XAU-IRR';

  @ApiPropertyOptional({ default: 18 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  karat?: number = 18;

  @ApiPropertyOptional({ default: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 100;
}

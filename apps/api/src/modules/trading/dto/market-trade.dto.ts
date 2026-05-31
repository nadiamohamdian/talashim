import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class MarketTradeDto {
  @ApiProperty({ example: 'cluser123' })
  @IsString()
  @MinLength(3)
  userId!: string;

  @ApiProperty({ example: '1.5', description: 'Gold quantity in grams' })
  @IsNumberString()
  quantityGram!: string;

  @ApiProperty({ example: 'trade-buy-20260530-001' })
  @IsString()
  @MinLength(8)
  idempotencyKey!: string;

  @ApiPropertyOptional({ default: 'XAU-IRR' })
  @IsOptional()
  @IsString()
  symbol?: string = 'XAU-IRR';

  @ApiPropertyOptional({ default: 18 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  karat?: number = 18;

  @ApiPropertyOptional({ example: 'Market buy gold' })
  @IsOptional()
  @IsString()
  description?: string;
}

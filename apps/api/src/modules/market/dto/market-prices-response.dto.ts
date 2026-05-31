import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MarketTickerItemDto {
  @ApiProperty({ example: 'IR_GOLD_18' })
  symbol!: string;

  @ApiProperty({ example: 'طلای ۱۸ عیار' })
  name!: string;

  @ApiProperty({ example: 17_972_400 })
  price!: number;

  @ApiPropertyOptional({ example: 0.42, nullable: true })
  changePercent!: number | null;

  @ApiProperty({ example: 'تومان' })
  unit!: string;

  @ApiPropertyOptional({ example: '2026-05-30T12:00:00.000Z', nullable: true })
  updatedAt!: string | null;
}

export class MarketPricesResponseDto {
  @ApiProperty({
    description: '18-karat gold price per gram (Toman)',
    example: 7_560_000,
    nullable: true,
  })
  gold_18k!: number | null;

  @ApiProperty({
    description: '24-karat gold price per gram (Toman)',
    example: 10_000_000,
    nullable: true,
  })
  gold_24k!: number | null;

  @ApiProperty({
    description: 'USD exchange rate (Toman)',
    example: 92_000,
    nullable: true,
  })
  usd!: number | null;

  @ApiProperty({
    description: 'Data source identifier',
    enum: ['brsapi', 'fallback', 'cache', 'stale'],
    example: 'cache',
  })
  source!: 'brsapi' | 'fallback' | 'cache' | 'stale';

  @ApiProperty({ description: 'Upstream provider name', example: 'brsapi' })
  provider!: string;

  @ApiProperty({
    description: 'ISO timestamp of the last successful sync',
    example: '2026-05-30T12:00:00.000Z',
  })
  updatedAt!: string;

  @ApiProperty({
    type: [MarketTickerItemDto],
    description: 'Extended gold and coin ticker items',
  })
  items!: MarketTickerItemDto[];

  @ApiPropertyOptional({
    description: 'True when data is served from stale cache (provider unavailable)',
    example: false,
  })
  isStale?: boolean;

  @ApiPropertyOptional({
    description: 'Age of cached data in seconds',
    example: 12,
    nullable: true,
  })
  cacheAgeSeconds?: number | null;

  @ApiPropertyOptional({
    enum: ['fresh', 'stale', 'miss'],
    description: 'Redis cache freshness classification',
    example: 'fresh',
  })
  cacheFreshness?: 'fresh' | 'stale' | 'miss';
}

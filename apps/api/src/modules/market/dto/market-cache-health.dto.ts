import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MarketCacheLayerHealthDto {
  @ApiProperty({ example: true })
  present!: boolean;

  @ApiProperty({ enum: ['fresh', 'stale', 'miss'], example: 'fresh' })
  freshness!: string;

  @ApiPropertyOptional({ example: 12, nullable: true })
  ageSeconds!: number | null;

  @ApiPropertyOptional({ example: 33, nullable: true })
  ttlSeconds!: number | null;
}

export class MarketCacheHealthResponseDto {
  @ApiProperty({ enum: ['ok', 'degraded', 'down'], example: 'ok' })
  status!: string;

  @ApiProperty({ enum: ['up', 'down'], example: 'up' })
  redis!: string;

  @ApiProperty({ type: MarketCacheLayerHealthDto })
  gold!: MarketCacheLayerHealthDto;

  @ApiProperty({ type: MarketCacheLayerHealthDto })
  currency!: MarketCacheLayerHealthDto;

  @ApiProperty({ type: MarketCacheLayerHealthDto })
  snapshot!: MarketCacheLayerHealthDto;

  @ApiPropertyOptional({ example: '2026-05-30T12:00:00.000Z', nullable: true })
  lastSyncAt!: string | null;

  @ApiPropertyOptional({ example: 'brsapi', nullable: true })
  provider!: string | null;

  @ApiProperty({ example: '2026-05-30T12:00:05.000Z' })
  checkedAt!: string;
}

export class MarketCacheInvalidateResponseDto {
  @ApiProperty({ example: true })
  invalidated!: boolean;

  @ApiProperty({ example: 4 })
  keysRemoved!: number;
}

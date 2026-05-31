import { ApiProperty } from '@nestjs/swagger';

class VolumeByTypeDto {
  @ApiProperty({ example: 'TRADE_BUY' })
  type!: string;

  @ApiProperty({ example: 12 })
  count!: number;
}

class TradesBySideDto {
  @ApiProperty({ example: 'BUY' })
  side!: string;

  @ApiProperty({ example: 8 })
  count!: number;
}

export class AdminAnalyticsResponseDto {
  @ApiProperty({ example: 1250 })
  totalUsers!: number;

  @ApiProperty({ example: 3 })
  adminUsers!: number;

  @ApiProperty({ example: 14 })
  pendingKyc!: number;

  @ApiProperty({ example: 320 })
  walletTransactions24h!: number;

  @ApiProperty({ example: 87 })
  goldTrades24h!: number;

  @ApiProperty({ type: [VolumeByTypeDto] })
  walletVolumeByType!: VolumeByTypeDto[];

  @ApiProperty({ type: [TradesBySideDto] })
  tradesBySide!: TradesBySideDto[];
}

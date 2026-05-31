import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  GoldTradeSide,
  GoldTradeStatus,
  WalletTransactionStatus,
  WalletTransactionType,
} from '@/generated/prisma';

export class GoldTradeOrderDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  orderNumber!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty({ enum: GoldTradeSide })
  side!: GoldTradeSide;

  @ApiProperty({ enum: GoldTradeStatus })
  status!: GoldTradeStatus;

  @ApiProperty()
  symbol!: string;

  @ApiProperty()
  karat!: number;

  @ApiProperty()
  quantityGram!: string;

  @ApiProperty()
  unitPriceToman!: string;

  @ApiProperty()
  grossRial!: string;

  @ApiProperty()
  commissionRial!: string;

  @ApiProperty()
  netRial!: string;

  @ApiProperty()
  commissionPercent!: string;

  @ApiPropertyOptional()
  walletTransactionId?: string | null;

  @ApiPropertyOptional()
  failureReason?: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional()
  filledAt?: string | null;
}

export class TradeWalletTransactionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  reference!: string;

  @ApiProperty({ enum: WalletTransactionType })
  type!: WalletTransactionType;

  @ApiProperty({ enum: WalletTransactionStatus })
  status!: WalletTransactionStatus;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiProperty()
  createdAt!: string;
}

export class GoldTradeOrderDetailDto extends GoldTradeOrderDto {
  @ApiPropertyOptional({ type: TradeWalletTransactionDto })
  transaction?: TradeWalletTransactionDto;

  @ApiProperty({ type: [Object] })
  auditLogs!: Array<{
    id: string;
    action: string;
    createdAt: string;
    context?: Record<string, unknown> | null;
  }>;
}

export class GoldTradeHistoryResponseDto {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty({ type: [GoldTradeOrderDto] })
  items!: GoldTradeOrderDto[];
}

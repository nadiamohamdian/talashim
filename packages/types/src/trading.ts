import type { PaginatedResponse } from './pagination';

export interface LiveGoldPrice {
  symbol: string;
  karat: number;
  pricePerGram: string;
  buyPrice: string;
  sellPrice: string;
  spreadPercent: string;
  source: string;
  providerName: string;
  recordedAt: string;
}

export interface GoldPriceHistoryPoint {
  id: string;
  pricePerGram: string;
  buyPrice: string;
  sellPrice: string;
  recordedAt: string;
}

export interface WalletBalances {
  rialBalance: string;
  goldBalanceGram: string;
}

export type TradeSide = 'BUY' | 'SELL';

export interface GoldTradeOrder {
  id: string;
  orderNumber: string;
  userId: string;
  side: TradeSide;
  status: 'PENDING' | 'FILLED' | 'FAILED';
  symbol: string;
  karat: number;
  quantityGram: string;
  unitPriceToman: string;
  grossRial: string;
  commissionRial: string;
  netRial: string;
  commissionPercent: string;
  walletTransactionId?: string | null;
  failureReason?: string | null;
  createdAt: string;
  filledAt?: string | null;
}

export type TradeHistoryResponse = PaginatedResponse<GoldTradeOrder>;

export interface WalletTransactionEntry {
  accountCode: string;
  side: string;
  assetType: string;
  amount: string;
}

export interface WalletTransaction {
  id: string;
  reference: string;
  type: string;
  status: string;
  description: string | null;
  createdAt: string;
  entries: WalletTransactionEntry[];
}

export type WalletHistoryResponse = PaginatedResponse<WalletTransaction>;

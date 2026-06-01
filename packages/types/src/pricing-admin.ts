export interface LiveGoldPriceDto {
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

export interface GoldPriceHistoryItemDto {
  id: string;
  pricePerGram: string;
  buyPrice: string;
  sellPrice: string;
  source: string;
  providerName: string;
  recordedAt: string;
}

export interface PricingMarginsDto {
  spreadPercent: number;
  tradeCommissionPercent: number;
  defaultMakingFeePercent: number;
  refreshIntervalMs: number;
  primaryProviderName: string;
  fallbackProviderName: string;
  brsEnabled: boolean;
  updatedAt: string;
}

export interface PricingProviderStatusDto {
  key: string;
  name: string;
  role: 'primary' | 'fallback' | 'market';
  enabled: boolean;
  configured: boolean;
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  message?: string;
  lastCheckedAt: string;
}

export interface PricingProvidersResponseDto {
  providers: PricingProviderStatusDto[];
  marketCache: {
    status: string;
    redis: string;
    lastSyncAt: string | null;
    provider: string | null;
  } | null;
  env: {
    brsApiConfigured: boolean;
    primaryUrlConfigured: boolean;
    refreshIntervalMs: number;
  };
}

export interface GoldPriceOverrideDto {
  id: string;
  symbol: string;
  karat: number;
  pricePerGram: string;
  buyPrice: string | null;
  sellPrice: string | null;
  reason: string | null;
  isActive: boolean;
  expiresAt: string | null;
  createdBy: { id: string; fullName: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

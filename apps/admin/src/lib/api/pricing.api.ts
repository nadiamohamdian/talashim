import { axiosClient } from '@/shared/api/axios-client';

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

export interface GoldPriceHistoryItem {
  id: string;
  pricePerGram: string;
  buyPrice: string;
  sellPrice: string;
  source: string;
  providerName: string;
  recordedAt: string;
}

export function fetchLiveGoldPrice(params?: { symbol?: string; karat?: number }) {
  return axiosClient.get<LiveGoldPrice>('/pricing/live', { params }).then((r) => r.data);
}

export function refreshLiveGoldPrice(params?: { symbol?: string; karat?: number }) {
  return axiosClient.post<LiveGoldPrice>('/pricing/refresh', null, { params }).then((r) => r.data);
}

export function fetchGoldPriceHistory(params?: {
  symbol?: string;
  karat?: number;
  limit?: number;
}) {
  return axiosClient
    .get<GoldPriceHistoryItem[]>('/pricing/history', { params })
    .then((r) => r.data);
}

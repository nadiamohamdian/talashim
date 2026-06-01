import { axiosClient } from '@/shared/api/axios-client';
import type {
  GoldPriceHistoryItemDto,
  GoldPriceOverrideDto,
  LiveGoldPriceDto,
  PaginatedResponse,
  PricingMarginsDto,
  PricingProvidersResponseDto,
} from '@sadafgold/types';

export function fetchAdminLivePrice(params?: { symbol?: string; karat?: number }) {
  return axiosClient.get<LiveGoldPriceDto>('/admin/pricing/live', { params }).then((r) => r.data);
}

export function refreshAdminLivePrice(params?: { symbol?: string; karat?: number }) {
  return axiosClient
    .post<LiveGoldPriceDto>('/admin/pricing/refresh', null, { params })
    .then((r) => r.data);
}

export interface AdminPriceHistoryResponse {
  symbol: string;
  karat: number;
  period: { from: string; to: string };
  total: number;
  items: GoldPriceHistoryItemDto[];
}

export function fetchAdminPriceHistory(params?: {
  symbol?: string;
  karat?: number;
  from?: string;
  to?: string;
  limit?: number;
}) {
  return axiosClient
    .get<AdminPriceHistoryResponse>('/admin/pricing/history', { params })
    .then((r) => r.data);
}

export function fetchPricingProviders() {
  return axiosClient
    .get<PricingProvidersResponseDto>('/admin/pricing/providers')
    .then((r) => r.data);
}

export function fetchPricingMargins() {
  return axiosClient.get<PricingMarginsDto>('/admin/pricing/margins').then((r) => r.data);
}

export function updatePricingMargins(
  payload: Omit<PricingMarginsDto, 'updatedAt' | 'primaryProviderName' | 'fallbackProviderName'> & {
    brsEnabled?: boolean;
  },
) {
  return axiosClient
    .patch<PricingMarginsDto>('/admin/pricing/margins', payload)
    .then((r) => r.data);
}

export function fetchPriceOverrides(params?: { page?: number; activeOnly?: boolean }) {
  return axiosClient
    .get<PaginatedResponse<GoldPriceOverrideDto>>('/admin/pricing/overrides', { params })
    .then((r) => r.data);
}

export type UpsertPriceOverridePayload = {
  symbol?: string;
  karat?: number;
  pricePerGram: number;
  buyPrice?: number;
  sellPrice?: number;
  reason?: string;
  isActive?: boolean;
  expiresAt?: string;
};

export function createPriceOverride(payload: UpsertPriceOverridePayload) {
  return axiosClient
    .post<GoldPriceOverrideDto>('/admin/pricing/overrides', payload)
    .then((r) => r.data);
}

export function updatePriceOverride(id: string, payload: UpsertPriceOverridePayload) {
  return axiosClient
    .patch<GoldPriceOverrideDto>(`/admin/pricing/overrides/${id}`, payload)
    .then((r) => r.data);
}

export function deletePriceOverride(id: string) {
  return axiosClient.delete<{ ok: boolean }>(`/admin/pricing/overrides/${id}`).then((r) => r.data);
}

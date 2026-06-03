import { axiosClient } from '@/shared/api/axios-client';
import type {
  AdminTradeOrderDetailDto,
  AdminTradeOrderDto,
  PaginatedResponse,
  TradingReportRow,
  TradingReportSummary,
  TradingSettlementSummary,
} from '@talashim/types';
import type { ReportListResponse, TradingReportParams } from '@/features/reports/api/reports-api';

export interface TradingOrdersParams {
  page?: number;
  limit?: number;
  side?: string;
  status?: string;
  search?: string;
  userId?: string;
  from?: string;
  to?: string;
}

export function fetchTradingOrders(params: TradingOrdersParams = {}) {
  return axiosClient
    .get<PaginatedResponse<AdminTradeOrderDto>>('/admin/trading/orders', { params })
    .then((r) => r.data);
}

export function fetchTradingOrder(id: string) {
  return axiosClient
    .get<AdminTradeOrderDetailDto>(`/admin/trading/orders/${id}`)
    .then((r) => r.data);
}

export function fetchSettlementSummary() {
  return axiosClient
    .get<TradingSettlementSummary>('/admin/trading/settlement/summary')
    .then((r) => r.data);
}

export function fetchSettlementQueue(params: TradingOrdersParams = {}) {
  return axiosClient
    .get<PaginatedResponse<AdminTradeOrderDto>>('/admin/trading/settlement/queue', { params })
    .then((r) => r.data);
}

export function settleTradeOrder(id: string) {
  return axiosClient
    .post<AdminTradeOrderDetailDto>(`/admin/trading/orders/${id}/settle`)
    .then((r) => r.data);
}

export function cancelTradeOrder(id: string, reason: string) {
  return axiosClient
    .post<AdminTradeOrderDetailDto>(`/admin/trading/orders/${id}/cancel`, { reason })
    .then((r) => r.data);
}

export function fetchTradingSectionReport(params: TradingReportParams = {}) {
  return axiosClient
    .get<ReportListResponse<TradingReportRow, TradingReportSummary>>('/admin/trading/reports', {
      params,
    })
    .then((r) => r.data);
}

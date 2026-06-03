import { axiosClient } from '@/shared/api/axios-client';
import type {
  FinancialReportRow,
  FinancialReportSummary,
  InventoryReportRow,
  InventoryReportSummary,
  SalesReportOrderRow,
  SalesReportSummary,
  TradingReportRow,
  TradingReportSummary,
  UsersReportRow,
  UsersReportSummary,
} from '@talashim/types';

export interface ReportListResponse<TItem, TSummary> {
  summary: TSummary;
  page: number;
  limit: number;
  total: number;
  items: TItem[];
}

export interface SalesReportParams {
  page?: number;
  from?: string;
  to?: string;
  status?: string;
}

export function fetchSalesReport(params: SalesReportParams = {}) {
  return axiosClient
    .get<ReportListResponse<SalesReportOrderRow, SalesReportSummary>>('/admin/reports/sales', {
      params,
    })
    .then((r) => r.data);
}

export interface InventoryReportParams {
  page?: number;
  category?: string;
  search?: string;
  lowStockOnly?: boolean;
}

export function fetchInventoryReport(params: InventoryReportParams = {}) {
  return axiosClient
    .get<ReportListResponse<InventoryReportRow, InventoryReportSummary>>(
      '/admin/reports/inventory',
      { params },
    )
    .then((r) => r.data);
}

export interface UsersReportParams {
  page?: number;
  from?: string;
  to?: string;
  role?: string;
  search?: string;
}

export function fetchUsersReport(params: UsersReportParams = {}) {
  return axiosClient
    .get<ReportListResponse<UsersReportRow, UsersReportSummary>>('/admin/reports/users', {
      params,
    })
    .then((r) => r.data);
}

export interface TradingReportParams {
  page?: number;
  from?: string;
  to?: string;
  side?: string;
  status?: string;
}

export function fetchTradingReport(params: TradingReportParams = {}) {
  return axiosClient
    .get<ReportListResponse<TradingReportRow, TradingReportSummary>>(
      '/admin/reports/trading',
      { params },
    )
    .then((r) => r.data);
}

export interface FinancialReportParams {
  page?: number;
  from?: string;
  to?: string;
  type?: string;
}

export function fetchFinancialReport(params: FinancialReportParams = {}) {
  return axiosClient
    .get<ReportListResponse<FinancialReportRow, FinancialReportSummary>>(
      '/admin/reports/financial',
      { params },
    )
    .then((r) => r.data);
}

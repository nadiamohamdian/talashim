import { axiosClient } from '@/shared/api/axios-client';
import type {
  AccountingSummary,
  FinanceReportSummary,
  LedgerAccountRow,
  LedgerEntryRow,
  PaginatedResponse,
} from '@talashim/types';
import type { AdminPaginated, AdminTradeOrder, AdminWalletRow, AdminWalletTransaction } from '@talashim/types';

export function fetchLedgerEntries(params?: {
  page?: number;
  search?: string;
  accountCode?: string;
  userId?: string;
  assetType?: string;
  side?: string;
  from?: string;
  to?: string;
}) {
  return axiosClient
    .get<PaginatedResponse<LedgerEntryRow>>('/admin/ledger/entries', { params })
    .then((r) => r.data);
}

export function fetchLedgerAccounts(params?: {
  page?: number;
  search?: string;
  category?: string;
  userId?: string;
}) {
  return axiosClient
    .get<PaginatedResponse<LedgerAccountRow>>('/admin/ledger/accounts', { params })
    .then((r) => r.data);
}

export function fetchAccountingSummary(params?: { search?: string; category?: string }) {
  return axiosClient
    .get<AccountingSummary>('/admin/accounting/summary', { params })
    .then((r) => r.data);
}

export interface FinanceReportsResponse {
  summary: FinanceReportSummary;
  page: number;
  limit: number;
  total: number;
  items: Array<{
    id: string;
    reference: string;
    type: string;
    status: string;
    description: string | null;
    user: { id: string; email: string; fullName: string } | null;
    createdAt: string;
  }>;
}

export function fetchFinanceReports(params?: {
  page?: number;
  from?: string;
  to?: string;
  type?: string;
}) {
  return axiosClient
    .get<FinanceReportsResponse>('/admin/finance/reports', { params })
    .then((r) => r.data);
}

export {
  fetchTradeOrders,
  fetchWalletTransactions,
  fetchWallets,
} from '@/features/admin/api/admin-api';

export type { AdminPaginated, AdminTradeOrder, AdminWalletRow, AdminWalletTransaction };

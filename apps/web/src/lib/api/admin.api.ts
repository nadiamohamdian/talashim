import type {
  AdminAnalytics,
  AdminAuditLog,
  AdminKycItem,
  AdminPaginated,
  AdminTradeOrder,
  AdminUser,
  AdminWalletRow,
  AdminWalletTransaction,
} from '@talashim/types';
import { apiGet, apiPatch } from '@/lib/api/client';
import type { AdminUsersParams } from '@/lib/api/query-keys';

export const adminApi = {
  getAnalytics(signal?: AbortSignal): Promise<AdminAnalytics> {
    return apiGet<AdminAnalytics>('/admin/analytics', {
      signal,
      abortKey: 'admin:analytics',
    });
  },

  listUsers(
    params: AdminUsersParams = {},
    signal?: AbortSignal,
  ): Promise<AdminPaginated<AdminUser>> {
    return apiGet<AdminPaginated<AdminUser>>('/admin/users', {
      params,
      signal,
      abortKey: `admin:users:${JSON.stringify(params)}`,
    });
  },

  updateUserRole(
    userId: string,
    role: 'CUSTOMER' | 'SUPER_ADMIN' | 'SUPPORT' | 'ACCOUNTANT' | 'EDITOR' | 'WAREHOUSE',
  ): Promise<AdminUser> {
    return apiPatch<AdminUser>(`/admin/users/${userId}/role`, { role });
  },

  listKyc(
    params: { page?: number; status?: string } = {},
    signal?: AbortSignal,
  ): Promise<AdminPaginated<AdminKycItem>> {
    return apiGet<AdminPaginated<AdminKycItem>>('/admin/kyc', {
      params,
      signal,
      abortKey: `admin:kyc:${JSON.stringify(params)}`,
    });
  },

  reviewKyc(
    id: string,
    payload: { status: 'APPROVED' | 'REJECTED'; reviewNote?: string },
  ): Promise<AdminKycItem> {
    return apiPatch<AdminKycItem>(`/admin/kyc/${id}/review`, payload);
  },

  listWalletTransactions(
    params: { page?: number; type?: string; userId?: string } = {},
    signal?: AbortSignal,
  ): Promise<AdminPaginated<AdminWalletTransaction>> {
    return apiGet<AdminPaginated<AdminWalletTransaction>>('/admin/transactions/wallet', {
      params,
      signal,
    });
  },

  listTradeOrders(
    params: { page?: number; side?: string; userId?: string } = {},
    signal?: AbortSignal,
  ): Promise<AdminPaginated<AdminTradeOrder>> {
    return apiGet<AdminPaginated<AdminTradeOrder>>('/admin/transactions/trades', {
      params,
      signal,
    });
  },

  listWallets(
    params: { page?: number; search?: string } = {},
    signal?: AbortSignal,
  ): Promise<AdminPaginated<AdminWalletRow>> {
    return apiGet<AdminPaginated<AdminWalletRow>>('/admin/wallets', {
      params,
      signal,
    });
  },

  listAuditLogs(
    params: { page?: number; source?: string } = {},
    signal?: AbortSignal,
  ): Promise<AdminPaginated<AdminAuditLog>> {
    return apiGet<AdminPaginated<AdminAuditLog>>('/admin/audit-logs', {
      params,
      signal,
    });
  },
};

export const {
  getAnalytics,
  listUsers,
  updateUserRole,
  listKyc,
  reviewKyc,
  listWalletTransactions,
  listTradeOrders,
  listWallets,
  listAuditLogs,
} = adminApi;

import { axiosClient } from '@/shared/api/axios-client';
import type {
  AdminAnalytics,
  AdminAuditLog,
  AdminKycItem,
  AdminPaginated,
  AdminTradeOrder,
  AdminUser,
  AdminWalletRow,
  AdminWalletTransaction,
} from '../model/types';

export function fetchAnalytics() {
  return axiosClient.get<AdminAnalytics>('/admin/analytics').then((r) => r.data);
}

export function fetchUsers(params: { page?: number; search?: string; role?: string }) {
  return axiosClient.get<AdminPaginated<AdminUser>>('/admin/users', { params }).then((r) => r.data);
}

export function updateUserRole(userId: string, role: 'CUSTOMER' | 'ADMIN') {
  return axiosClient.patch<AdminUser>(`/admin/users/${userId}/role`, { role }).then((r) => r.data);
}

export function fetchKyc(params: { page?: number; status?: string }) {
  return axiosClient
    .get<AdminPaginated<AdminKycItem>>('/admin/kyc', { params })
    .then((r) => r.data);
}

export function reviewKyc(
  id: string,
  payload: { status: 'APPROVED' | 'REJECTED'; reviewNote?: string },
) {
  return axiosClient.patch<AdminKycItem>(`/admin/kyc/${id}/review`, payload).then((r) => r.data);
}

export function fetchWalletTransactions(params: { page?: number; type?: string; userId?: string }) {
  return axiosClient
    .get<AdminPaginated<AdminWalletTransaction>>('/admin/transactions/wallet', { params })
    .then((r) => r.data);
}

export function fetchTradeOrders(params: { page?: number; side?: string; userId?: string }) {
  return axiosClient
    .get<AdminPaginated<AdminTradeOrder>>('/admin/transactions/trades', { params })
    .then((r) => r.data);
}

export function fetchWallets(params: { page?: number; search?: string }) {
  return axiosClient
    .get<AdminPaginated<AdminWalletRow>>('/admin/wallets', { params })
    .then((r) => r.data);
}

export function fetchAuditLogs(params: { page?: number; source?: string }) {
  return axiosClient
    .get<AdminPaginated<AdminAuditLog>>('/admin/audit-logs', { params })
    .then((r) => r.data);
}

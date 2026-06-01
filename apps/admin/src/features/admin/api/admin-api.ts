import { axiosClient } from '@/shared/api/axios-client';
import {
  ADMIN_ROLE_DEFINITIONS,
  ALL_ADMIN_PERMISSIONS,
  type AdminPermissionKey,
} from '@sadafgold/shared/admin-rbac';
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

export interface AdminPermissionRegistry {
  permissions: readonly AdminPermissionKey[];
  roles: typeof ADMIN_ROLE_DEFINITIONS;
}

export interface AdminLoginHistoryItem {
  id: string;
  action: string;
  createdAt: string;
  actor?: { email?: string; fullName?: string; role?: string };
}

export interface AdminSessionItem {
  id: string;
  status: 'active' | 'revoked' | 'expired';
  createdAt: string;
  expiresAt: string;
  user: { id: string; email: string; fullName: string; role?: string };
  userId: string;
}

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

export function fetchPermissionRegistry(): Promise<AdminPermissionRegistry> {
  return Promise.resolve({
    permissions: ALL_ADMIN_PERMISSIONS,
    roles: ADMIN_ROLE_DEFINITIONS,
  });
}

export function fetchLoginHistory(params: {
  page?: number;
  search?: string;
  action?: string;
}): Promise<AdminPaginated<AdminLoginHistoryItem>> {
  const page = params.page ?? 1;
  const limit = 20;
  return axiosClient
    .get<AdminPaginated<AdminLoginHistoryItem>>('/admin/security/login-history', { params })
    .then((r) => r.data)
    .catch(() => ({ page, limit, total: 0, items: [] }));
}

export function fetchSessions(params: {
  page?: number;
  search?: string;
  status?: string;
}): Promise<AdminPaginated<AdminSessionItem>> {
  const page = params.page ?? 1;
  const limit = 20;
  return axiosClient
    .get<AdminPaginated<AdminSessionItem>>('/admin/security/sessions', { params })
    .then((r) => r.data)
    .catch(() => ({ page, limit, total: 0, items: [] }));
}

export function revokeSession(sessionId: string): Promise<{ ok: boolean }> {
  return axiosClient
    .delete<{ ok: boolean }>(`/admin/security/sessions/${sessionId}`)
    .then((r) => r.data)
    .catch(() => ({ ok: false }));
}

export function revokeUserSessions(userId: string): Promise<{ ok: boolean }> {
  return axiosClient
    .delete<{ ok: boolean }>(`/admin/security/users/${userId}/sessions`)
    .then((r) => r.data)
    .catch(() => ({ ok: false }));
}

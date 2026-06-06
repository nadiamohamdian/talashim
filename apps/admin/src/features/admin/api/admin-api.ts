import { axiosClient } from '@/shared/api/axios-client';
import type {
  AdminAnalytics,
  AdminAuditLog,
  AdminKycItem,
  AdminLoginHistoryItem,
  AdminPaginated,
  AdminPermissionRegistry,
  AdminMyPermissions,
  UpdateRolePermissionsBatchPayload,
  AdminSession,
  AdminTradeOrder,
  AdminUser,
  AdminWalletRow,
  AdminWalletTransaction,
  AdminPaymentReceiptItem,
  CreateStaffUserPayload,
  UpdateStaffUserPayload,
  AdminUserDetailView,
  AdminUserActivityItem,
  AdminUpdateUserContactPayload,
} from '../model/types';

export function fetchAnalytics() {
  return axiosClient.get<AdminAnalytics>('/admin/analytics').then((r) => r.data);
}

export function fetchUsers(params: {
  page?: number;
  search?: string;
  role?: string;
  staffOnly?: boolean;
}) {
  return axiosClient.get<AdminPaginated<AdminUser>>('/admin/users', { params }).then((r) => r.data);
}

export function updateUserRole(
  userId: string,
  role: 'CUSTOMER' | 'SUPER_ADMIN' | 'SUPPORT' | 'ACCOUNTANT' | 'EDITOR' | 'WAREHOUSE',
) {
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

export function fetchPaymentReceipts(params: { page?: number; status?: string }) {
  return axiosClient
    .get<AdminPaginated<AdminPaymentReceiptItem>>('/admin/transactions/payment-receipts', {
      params,
    })
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

export function fetchSessions(params: {
  page?: number;
  search?: string;
  status?: 'active' | 'revoked' | 'expired' | 'all';
}) {
  return axiosClient
    .get<AdminPaginated<AdminSession>>('/admin/security/sessions', { params })
    .then((r) => r.data);
}

export function revokeSession(sessionId: string) {
  return axiosClient
    .delete<{ success: boolean }>(`/admin/security/sessions/${sessionId}`)
    .then((r) => r.data);
}

export function revokeUserSessions(userId: string) {
  return axiosClient
    .delete<{ success: boolean; revokedCount: number }>(`/admin/security/users/${userId}/sessions`)
    .then((r) => r.data);
}

export function fetchLoginHistory(params: { page?: number; search?: string; action?: string }) {
  return axiosClient
    .get<AdminPaginated<AdminLoginHistoryItem>>('/admin/security/login-history', { params })
    .then((r) => r.data);
}

export function fetchPermissionRegistry() {
  return axiosClient
    .get<AdminPermissionRegistry>('/admin/security/permissions')
    .then((r) => r.data);
}

export function fetchMyPermissions() {
  return axiosClient
    .get<AdminMyPermissions>('/admin/security/permissions/me')
    .then((r) => r.data);
}

export function updateRolePermissions(payload: UpdateRolePermissionsBatchPayload) {
  return axiosClient
    .patch<AdminPermissionRegistry>('/admin/security/permissions', payload)
    .then((r) => r.data);
}

export function createStaffUser(payload: CreateStaffUserPayload) {
  return axiosClient.post<AdminUser>('/admin/staff', payload).then((r) => r.data);
}

export function updateStaffUser(userId: string, payload: UpdateStaffUserPayload) {
  return axiosClient.patch<AdminUser>(`/admin/staff/${userId}`, payload).then((r) => r.data);
}

export function revokeStaffUserSessions(userId: string) {
  return revokeUserSessions(userId);
}

export function fetchUserDetail(userId: string) {
  return axiosClient.get<AdminUserDetailView>(`/admin/users/${userId}`).then((r) => r.data);
}

export function updateUserContact(userId: string, payload: AdminUpdateUserContactPayload) {
  return axiosClient
    .patch<AdminUserDetailView>(`/admin/users/${userId}/contact`, payload)
    .then((r) => r.data);
}

export function fetchUserActivity(userId: string, params?: { page?: number }) {
  return axiosClient
    .get<AdminPaginated<AdminUserActivityItem>>(`/admin/users/${userId}/activity`, { params })
    .then((r) => r.data);
}

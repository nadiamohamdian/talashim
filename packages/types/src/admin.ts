import type { PaginatedResponse } from './pagination';
import type { StaffRoleEnum, StaffRoleSlug } from './roles';

export type AdminPaginated<T> = PaginatedResponse<T>;

export interface AdminAnalytics {
  totalUsers: number;
  adminUsers: number;
  pendingKyc: number;
  walletTransactions24h: number;
  goldTrades24h: number;
  walletVolumeByType: Array<{ type: string; count: number }>;
  tradesBySide: Array<{ side: string; count: number }>;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: StaffRoleSlug | 'customer';
  createdAt: string;
  kycVerification?: { status: string } | null;
}

export interface AdminKycItem {
  id: string;
  userId: string;
  nationalId: string;
  phone: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  user: { id: string; email: string; fullName: string };
}

export interface AdminWalletTransaction {
  id: string;
  reference: string;
  type: string;
  status: string;
  description: string | null;
  userId: string | null;
  user: { id: string; email: string; fullName: string } | null;
  createdAt: string;
  entries?: Array<{
    accountCode: string;
    side: string;
    assetType: string;
    amount: string;
  }>;
}

export interface AdminTradeOrder {
  id: string;
  orderNumber: string;
  userId: string;
  user: { id: string; email: string; fullName: string };
  side: string;
  status: string;
  quantityGram: string;
  netRial: string;
  createdAt: string;
}

export interface AdminWalletRow {
  user: { id: string; email: string; fullName: string; role: string };
  balances: { rialBalance: string; goldBalanceGram: string };
}

export interface AdminAuditLog {
  id: string;
  source: 'platform' | 'wallet' | 'trade';
  action: string;
  actorId: string | null;
  actor: { id: string; email: string; fullName: string } | null;
  context?: unknown;
  createdAt: string;
}

export type AdminSessionStatus = 'active' | 'revoked' | 'expired';

export interface AdminSession {
  id: string;
  userId: string;
  user: { id: string; email: string; fullName: string; role: string };
  status: AdminSessionStatus;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
}

export interface AdminLoginHistoryItem {
  id: string;
  action: string;
  actorId: string | null;
  actor: { id: string; email: string; fullName: string; role: string } | null;
  context?: unknown;
  createdAt: string;
}

export interface AdminPermissionRegistry {
  permissions: string[];
  roles: Array<{
    enum: string;
    slug: string;
    labelFa: string;
    descriptionFa: string;
    permissions: string[];
  }>;
  groups: Record<string, Record<string, string>>;
}

export interface CreateStaffUserPayload {
  email: string;
  fullName: string;
  password: string;
  role: StaffRoleEnum;
}

export interface UpdateStaffUserPayload {
  email?: string;
  fullName?: string;
  password?: string;
  role?: StaffRoleEnum;
}

export interface AdminUserAddress {
  id: string;
  title: string;
  recipient: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  createdAt: string;
}

export interface AdminUpdateUserContactPayload {
  phone?: string;
  nationalId?: string;
  address?: Partial<AdminUserAddress> & { id?: string };
}

export interface AdminUserDetailView {
  user: AdminUser & { createdAt: string };
  balances: { rialBalance: string; goldBalanceGram: string };
  stats: { orders: number; goldTrades: number };
  addresses: AdminUserAddress[];
  kyc: {
    id: string;
    status: string;
    nationalId: string;
    phone: string;
    submittedAt: string;
    reviewNote: string | null;
  } | null;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    totalToman: number;
    status: string;
  }>;
  recentWalletTransactions: Array<{ id: string; type: string; reference: string }>;
  recentTrades: Array<{
    id: string;
    orderNumber: string;
    side: string;
    quantityGram: string;
  }>;
}

export interface AdminUserActivityItem {
  id: string;
  source: string;
  action: string;
  context?: unknown;
  createdAt: string;
}

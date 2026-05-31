import type { PaginatedResponse } from './pagination';
export type AdminPaginated<T> = PaginatedResponse<T>;
export interface AdminAnalytics {
    totalUsers: number;
    adminUsers: number;
    pendingKyc: number;
    walletTransactions24h: number;
    goldTrades24h: number;
    walletVolumeByType: Array<{
        type: string;
        count: number;
    }>;
    tradesBySide: Array<{
        side: string;
        count: number;
    }>;
}
export interface AdminUser {
    id: string;
    email: string;
    fullName: string;
    role: 'customer' | 'admin';
    createdAt: string;
    kycVerification?: {
        status: string;
    } | null;
}
export interface AdminKycItem {
    id: string;
    userId: string;
    nationalId: string;
    phone: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    submittedAt: string;
    user: {
        id: string;
        email: string;
        fullName: string;
    };
}
export interface AdminWalletTransaction {
    id: string;
    reference: string;
    type: string;
    status: string;
    description: string | null;
    userId: string | null;
    user: {
        id: string;
        email: string;
        fullName: string;
    } | null;
    createdAt: string;
}
export interface AdminTradeOrder {
    id: string;
    orderNumber: string;
    userId: string;
    user: {
        id: string;
        email: string;
        fullName: string;
    };
    side: string;
    status: string;
    quantityGram: string;
    netRial: string;
    createdAt: string;
}
export interface AdminWalletRow {
    user: {
        id: string;
        email: string;
        fullName: string;
        role: string;
    };
    balances: {
        rialBalance: string;
        goldBalanceGram: string;
    };
}
export interface AdminAuditLog {
    id: string;
    source: 'platform' | 'wallet' | 'trade';
    action: string;
    actorId: string | null;
    actor: {
        id: string;
        email: string;
        fullName: string;
    } | null;
    createdAt: string;
}
//# sourceMappingURL=admin.d.ts.map
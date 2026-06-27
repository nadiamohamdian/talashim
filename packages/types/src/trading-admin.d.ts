export interface AdminTradeOrderDto {
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
    symbol: string;
    karat: number;
    quantityGram: string;
    unitPriceToman: string;
    grossRial: string;
    commissionRial: string;
    netRial: string;
    commissionPercent: string;
    failureReason: string | null;
    walletTransactionId: string | null;
    createdAt: string;
    filledAt: string | null;
}
export interface AdminTradeAuditLogDto {
    id: string;
    action: string;
    createdAt: string;
    context: Record<string, unknown> | null;
}
export interface AdminTradeOrderDetailDto extends AdminTradeOrderDto {
    transaction?: {
        id: string;
        reference: string;
        type: string;
        status: string;
        description: string | null;
        createdAt: string;
    };
    auditLogs: AdminTradeAuditLogDto[];
}
export interface TradingSettlementSummary {
    pendingCount: number;
    failedCount: number;
    filledTodayCount: number;
}
//# sourceMappingURL=trading-admin.d.ts.map
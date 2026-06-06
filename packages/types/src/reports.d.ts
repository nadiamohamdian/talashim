export interface ReportKpi {
    key: string;
    label: string;
    value: string | number;
    hint?: string;
}
export interface ReportChartPoint {
    label: string;
    value: number;
    secondaryValue?: number;
}
export interface ReportBreakdownRow {
    key: string;
    label: string;
    count: number;
    amount?: number;
}
export interface SalesReportSummary {
    kpis: ReportKpi[];
    byStatus: ReportBreakdownRow[];
    dailySeries: ReportChartPoint[];
    period: {
        from: string | null;
        to: string | null;
    };
}
export interface SalesReportOrderRow {
    id: string;
    orderNumber: string;
    status: string;
    totalToman: number;
    subtotalToman: number;
    taxToman: number;
    itemCount: number;
    user: {
        id: string;
        email: string;
        fullName: string;
    } | null;
    createdAt: string;
}
export interface InventoryReportSummary {
    kpis: ReportKpi[];
    byCategory: ReportBreakdownRow[];
    lowStockThreshold: number;
}
export interface InventoryReportRow {
    productId: string;
    sku: string;
    title: string;
    category: string;
    quantity: number;
    reserved: number;
    available: number;
    lowStock: boolean;
    updatedAt: string;
}
export interface UsersReportSummary {
    kpis: ReportKpi[];
    byRole: ReportBreakdownRow[];
    kycByStatus: ReportBreakdownRow[];
    registrationSeries: ReportChartPoint[];
    period: {
        from: string | null;
        to: string | null;
    };
}
export interface UsersReportRow {
    id: string;
    email: string;
    fullName: string;
    role: string;
    createdAt: string;
    kycStatus: string | null;
    orderCount: number;
}
export interface TradingReportSummary {
    kpis: ReportKpi[];
    bySide: ReportBreakdownRow[];
    byStatus: ReportBreakdownRow[];
    dailySeries: ReportChartPoint[];
    period: {
        from: string | null;
        to: string | null;
    };
}
export interface TradingReportRow {
    id: string;
    orderNumber: string;
    side: string;
    status: string;
    quantityGram: string;
    netRial: string;
    commissionRial: string;
    user: {
        id: string;
        email: string;
        fullName: string;
    };
    createdAt: string;
    filledAt: string | null;
}
export interface FinancialReportSummary {
    kpis: ReportKpi[];
    byType: ReportBreakdownRow[];
    byStatus: ReportBreakdownRow[];
    dailySeries: ReportChartPoint[];
    period: {
        from: string | null;
        to: string | null;
    };
}
export interface FinancialReportRow {
    id: string;
    reference: string;
    type: string;
    status: string;
    description: string | null;
    user: {
        id: string;
        email: string;
        fullName: string;
    } | null;
    createdAt: string;
}

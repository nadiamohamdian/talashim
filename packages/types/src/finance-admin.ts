import type { ReportBreakdownRow, ReportChartPoint, ReportKpi } from './reports';

export interface LedgerAccountRow {
  id: string;
  code: string;
  name: string;
  category: string;
  assetType: string | null;
  userId: string | null;
  user: { id: string; email: string; fullName: string } | null;
  balance: string;
  isActive: boolean;
}

export interface LedgerEntryRow {
  id: string;
  transactionId: string;
  reference: string;
  transactionType: string;
  transactionStatus: string;
  accountCode: string;
  accountName: string;
  side: string;
  assetType: string;
  amount: string;
  user: { id: string; email: string; fullName: string } | null;
  createdAt: string;
}

export interface AccountingSummary {
  kpis: ReportKpi[];
  byCategory: ReportBreakdownRow[];
  accounts: LedgerAccountRow[];
}

export interface FinanceReportSummary {
  period: { from: string | null; to: string | null };
  kpis: ReportKpi[];
  platformBalances: Array<{ assetType: string; label: string; balance: string }>;
  byType: ReportBreakdownRow[];
  dailySeries: ReportChartPoint[];
}

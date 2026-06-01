import { Injectable } from '@nestjs/common';
import { ADMIN_PERMISSIONS } from '@sadafgold/shared/admin-rbac';
import type {
  AccountingSummary,
  FinanceReportSummary,
  LedgerAccountRow,
  LedgerEntryRow,
} from '@sadafgold/types';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { assertAdminPermission } from '@/common/rbac/assert-admin-permission';
import type { Prisma } from '@/generated/prisma';
import { SYSTEM_LEDGER_ACCOUNTS } from '@/modules/ledger/constants/system-accounts';
import type {
  AdminAccountingQueryDto,
  AdminFinanceReportsQueryDto,
  AdminLedgerAccountsQueryDto,
  AdminLedgerEntriesQueryDto,
} from '../dto/admin-finance-query.dto';
import { AdminFinanceRepository } from '../repositories/admin-finance.repository';
import { AdminReportsRepository } from '../repositories/admin-reports.repository';

type EntryWithRelations = Prisma.LedgerEntryGetPayload<{
  include: {
    account: {
      include: { user: { select: { id: true; email: true; fullName: true } } };
    };
    transaction: {
      include: { user: { select: { id: true; email: true; fullName: true } } };
    };
  };
}>;

type AccountWithEntries = Prisma.LedgerAccountGetPayload<{
  include: {
    user: { select: { id: true; email: true; fullName: true } };
    entries: { select: { side: true; amount: true } };
  };
}>;

@Injectable()
export class AdminFinanceService {
  constructor(
    private readonly financeRepository: AdminFinanceRepository,
    private readonly reportsRepository: AdminReportsRepository,
  ) {}

  async listLedgerEntries(
    query: AdminLedgerEntriesQueryDto,
    actor: AuthenticatedUser,
  ) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.ledger.read);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await this.financeRepository.listLedgerEntries(
      skip,
      limit,
      {
        search: query.search,
        accountCode: query.accountCode,
        userId: query.userId,
        transactionId: query.transactionId,
        assetType: query.assetType,
        side: query.side,
        from: query.from ? new Date(query.from) : undefined,
        to: query.to ? new Date(query.to) : undefined,
      },
    );

    return {
      page,
      limit,
      total,
      items: items.map((entry) => this.mapLedgerEntry(entry)),
    };
  }

  async listLedgerAccounts(
    query: AdminLedgerAccountsQueryDto,
    actor: AuthenticatedUser,
  ) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.ledger.read);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [accounts, total] = await this.financeRepository.listLedgerAccounts(
      skip,
      limit,
      {
        search: query.search,
        category: query.category,
        userId: query.userId,
      },
    );

    return {
      page,
      limit,
      total,
      items: accounts.map((account) => this.mapLedgerAccount(account)),
    };
  }

  async getAccountingSummary(
    query: AdminAccountingQueryDto,
    actor: AuthenticatedUser,
  ): Promise<AccountingSummary> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.ledger.read);

    const accounts = await this.financeRepository.listAllAccountsForSummary(
      query.category,
    );

    let filtered = accounts;
    if (query.search?.trim()) {
      const term = query.search.trim().toLowerCase();
      filtered = accounts.filter(
        (a) =>
          a.code.toLowerCase().includes(term) ||
          a.name.toLowerCase().includes(term),
      );
    }

    const rows = filtered.map((account) => this.mapLedgerAccount(account));

    const byCategory = new Map<string, { count: number; amount: number }>();
    for (const row of rows) {
      const current = byCategory.get(row.category) ?? { count: 0, amount: 0 };
      current.count += 1;
      current.amount += Math.abs(Number(row.balance));
      byCategory.set(row.category, current);
    }

    const categoryLabels: Record<string, string> = {
      ASSET: 'دارایی',
      LIABILITY: 'بدهی',
      EQUITY: 'حقوق صاحبان سهام',
      REVENUE: 'درآمد',
      EXPENSE: 'هزینه',
    };

    const totalAssets = rows
      .filter((r) => r.category === 'ASSET')
      .reduce((s, r) => s + Number(r.balance), 0);
    const totalLiabilities = rows
      .filter((r) => r.category === 'LIABILITY')
      .reduce((s, r) => s + Number(r.balance), 0);
    const totalRevenue = rows
      .filter((r) => r.category === 'REVENUE')
      .reduce((s, r) => s + Number(r.balance), 0);

    return {
      kpis: [
        { key: 'accounts', label: 'تعداد حساب', value: rows.length },
        {
          key: 'assets',
          label: 'جمع دارایی‌ها',
          value: Math.round(totalAssets).toLocaleString('fa-IR'),
        },
        {
          key: 'liabilities',
          label: 'جمع بدهی‌ها',
          value: Math.round(totalLiabilities).toLocaleString('fa-IR'),
        },
        {
          key: 'revenue',
          label: 'درآمد انباشته',
          value: Math.round(totalRevenue).toLocaleString('fa-IR'),
        },
      ],
      byCategory: [...byCategory.entries()].map(([key, val]) => ({
        key,
        label: categoryLabels[key] ?? key,
        count: val.count,
        amount: Math.round(val.amount),
      })),
      accounts: rows,
    };
  }

  async getFinanceReports(
    query: AdminFinanceReportsQueryDto,
    actor: AuthenticatedUser,
  ) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.finance.reports);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const fromDate = query.from ? new Date(query.from) : undefined;
    const toDate = query.to ? new Date(query.to) : undefined;

    const [summary, [transactions, total], periodStats, systemAccounts] =
      await Promise.all([
        this.reportsRepository.getFinancialSummary(query.from, query.to),
        this.reportsRepository.listFinancialReport(
          skip,
          limit,
          query.from,
          query.to,
          query.type,
        ),
        this.financeRepository.getFinancePeriodStats(fromDate, toDate),
        this.financeRepository.listAllAccountsForSummary(),
      ]);

    const [txTotal, txPosted, byType, dailySeries, tradeAgg] = periodStats;

    const platformBalances = SYSTEM_LEDGER_ACCOUNTS.map((def) => {
      const account = systemAccounts.find((a) => a.code === def.code);
      const balance = account
        ? this.financeRepository.computeAccountBalance(
            account.category,
            account.entries,
          )
        : '0';
      return {
        assetType: def.assetType ?? 'RIAL',
        label: def.name,
        balance,
      };
    });

    const userRialTotal = systemAccounts
      .filter((a) => a.assetType === 'RIAL' && a.userId)
      .reduce(
        (sum, a) =>
          sum +
          Number(
            this.financeRepository.computeAccountBalance(a.category, a.entries),
          ),
        0,
      );

    const userGoldTotal = systemAccounts
      .filter((a) => a.assetType === 'GOLD' && a.userId)
      .reduce(
        (sum, a) =>
          sum +
          Number(
            this.financeRepository.computeAccountBalance(a.category, a.entries),
          ),
        0,
      );

    const reportSummary: FinanceReportSummary = {
      period: summary.period,
      kpis: [
        { key: 'txTotal', label: 'تراکنش‌ها', value: txTotal },
        { key: 'txPosted', label: 'ثبت‌شده', value: txPosted },
        {
          key: 'tradeVolume',
          label: 'حجم معاملات (ریال)',
          value: Number(tradeAgg._sum.netRial ?? 0).toLocaleString('fa-IR'),
        },
        {
          key: 'commission',
          label: 'کارمزد معاملات',
          value: Number(tradeAgg._sum.commissionRial ?? 0).toLocaleString(
            'fa-IR',
          ),
        },
        {
          key: 'userRial',
          label: 'موجودی ریالی کاربران',
          value: Math.round(userRialTotal).toLocaleString('fa-IR'),
        },
        {
          key: 'userGold',
          label: 'موجودی طلای کاربران (گرم)',
          value: userGoldTotal.toFixed(4),
        },
      ],
      platformBalances,
      byType: byType.map((row) => ({
        key: row.type,
        label: row.type,
        count: row._count._all,
      })),
      dailySeries,
    };

    return {
      summary: reportSummary,
      page,
      limit,
      total,
      items: transactions.map((tx) => ({
        id: tx.id,
        reference: tx.reference,
        type: tx.type,
        status: tx.status,
        description: tx.description,
        user: tx.user,
        createdAt: tx.createdAt.toISOString(),
      })),
    };
  }

  private mapLedgerEntry(entry: EntryWithRelations): LedgerEntryRow {
    return {
      id: entry.id,
      transactionId: entry.transactionId,
      reference: entry.transaction.reference,
      transactionType: entry.transaction.type,
      transactionStatus: entry.transaction.status,
      accountCode: entry.account.code,
      accountName: entry.account.name,
      side: entry.side,
      assetType: entry.assetType,
      amount: entry.amount.toString(),
      user: entry.transaction.user ?? entry.account.user,
      createdAt: entry.createdAt.toISOString(),
    };
  }

  private mapLedgerAccount(account: AccountWithEntries): LedgerAccountRow {
    return {
      id: account.id,
      code: account.code,
      name: account.name,
      category: account.category,
      assetType: account.assetType,
      userId: account.userId,
      user: account.user,
      balance: this.financeRepository.computeAccountBalance(
        account.category,
        account.entries,
      ),
      isActive: account.isActive,
    };
  }
}

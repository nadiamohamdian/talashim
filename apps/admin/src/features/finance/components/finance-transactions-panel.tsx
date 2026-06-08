'use client';

import { formatPersianDateTime } from '@/shared/lib/format-date';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  Label,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@talashim/ui';
import { fetchWalletTransactions } from '../api/finance-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { FinancePageShell } from './finance-page-shell';
import { PaymentReceiptsPanel } from './payment-receipts-panel';
import { WalletWithdrawalRequestsPanel } from './wallet-withdrawal-requests-panel';
import {
  formatToman,
  selectFieldClass,
  WALLET_TX_STATUS_FA,
  WALLET_TX_TYPE_FA,
} from '../lib/labels';

type TransactionsTab = 'wallet' | 'wallet-withdrawals' | 'receipts';

export function FinanceTransactionsPanel() {
  const [tab, setTab] = useState<TransactionsTab>('wallet');
  const [walletType, setWalletType] = useState('');
  const [walletPage, setWalletPage] = useState(1);

  const walletQuery = useQuery({
    queryKey: adminQueryKeys.walletTx(walletPage, walletType),
    queryFn: () => fetchWalletTransactions({ type: walletType || undefined, page: walletPage }),
    enabled: tab === 'wallet',
  });

  return (
    <FinancePageShell routeId="finance.transactions">
      <div className="admin-tab-pills">
        <button
          type="button"
          onClick={() => setTab('wallet')}
          data-active={tab === 'wallet'}
          className="admin-tab-pill"
        >
          تراکنش‌های کیف پول
        </button>
        <button
          type="button"
          onClick={() => setTab('wallet-withdrawals')}
          data-active={tab === 'wallet-withdrawals'}
          className="admin-tab-pill"
        >
          درخواست‌های برداشت
        </button>
        <button
          type="button"
          onClick={() => setTab('receipts')}
          data-active={tab === 'receipts'}
          className="admin-tab-pill"
        >
          فیش‌های واریز
        </button>
      </div>

      {tab === 'wallet-withdrawals' ? (
        <WalletWithdrawalRequestsPanel />
      ) : tab === 'receipts' ? (
        <PaymentReceiptsPanel />
      ) : (
        <>
          <p className="text-sm text-muted">
            تراکنش‌های کیف پول تومانی و طلای کاربران. معاملات آب‌شده در بخش «طلای آب‌شده» است.
          </p>
          <FilterBar>
            <div>
              <Label>نوع تراکنش</Label>
              <select
                className={selectFieldClass}
                value={walletType}
                onChange={(e) => {
                  setWalletType(e.target.value);
                  setWalletPage(1);
                }}
              >
                <option value="">همه</option>
                {Object.entries(WALLET_TX_TYPE_FA).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </FilterBar>
          <Card className="overflow-hidden border-[var(--border-subtle)] bg-[var(--card)] p-0">
            {walletQuery.isLoading ? (
              <Skeleton className="m-6 h-64" />
            ) : walletQuery.isError ? (
              <p className="p-6 text-[var(--error)]">بارگذاری تراکنش‌ها ناموفق بود.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>مرجع</TableHead>
                    <TableHead>کاربر</TableHead>
                    <TableHead>نوع</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>سطرهای دفتر</TableHead>
                    <TableHead>زمان</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {walletQuery.data?.items.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-xs" dir="ltr">
                        {tx.reference}
                      </TableCell>
                      <TableCell>{tx.user?.fullName ?? '—'}</TableCell>
                      <TableCell>{WALLET_TX_TYPE_FA[tx.type] ?? tx.type}</TableCell>
                      <TableCell>{WALLET_TX_STATUS_FA[tx.status] ?? tx.status}</TableCell>
                      <TableCell className="max-w-xs text-xs text-[var(--muted-foreground)]">
                        {tx.entries?.map((e) => (
                          <div key={`${e.accountCode}-${e.side}`} dir="ltr">
                            {e.accountCode}: {e.side}{' '}
                            {e.assetType === 'GOLD'
                              ? `${e.amount} گرم`
                              : `${formatToman(e.amount)} تومان`}
                          </div>
                        )) ?? '—'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatPersianDateTime(tx.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
          {walletQuery.data ? (
            <PaginationBar
              page={walletQuery.data.page}
              total={walletQuery.data.total}
              limit={walletQuery.data.limit}
              onPageChange={setWalletPage}
            />
          ) : null}
        </>
      )}
    </FinancePageShell>
  );
}

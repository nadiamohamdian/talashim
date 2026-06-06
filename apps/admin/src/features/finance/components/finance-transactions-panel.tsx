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
import { selectFieldClass, WALLET_TX_STATUS_FA, WALLET_TX_TYPE_FA } from '../lib/labels';

type TransactionsTab = 'wallet' | 'receipts';

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
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        <button
          type="button"
          onClick={() => setTab('wallet')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            tab === 'wallet'
              ? 'bg-[var(--primary)] text-white'
              : 'bg-[var(--surface)] text-muted hover:text-foreground'
          }`}
        >
          تراکنش‌های کیف پول
        </button>
        <button
          type="button"
          onClick={() => setTab('receipts')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            tab === 'receipts'
              ? 'bg-[var(--primary)] text-white'
              : 'bg-[var(--surface)] text-muted hover:text-foreground'
          }`}
        >
          فیش‌های پرداخت
        </button>
      </div>

      {tab === 'receipts' ? (
        <PaymentReceiptsPanel />
      ) : (
        <>
          <p className="text-sm text-stone-500">
            تراکنش‌های کیف پول ریالی و طلای کاربران. معاملات آب‌شده در بخش «طلای آب‌شده» است.
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
          <Card className="overflow-hidden border-border bg-white p-0">
            {walletQuery.isLoading ? (
              <Skeleton className="m-6 h-64" />
            ) : walletQuery.isError ? (
              <p className="p-6 text-rose-600">بارگذاری تراکنش‌ها ناموفق بود.</p>
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
                      <TableCell className="max-w-xs text-xs text-stone-600">
                        {tx.entries?.map((e) => (
                          <div key={`${e.accountCode}-${e.side}`} dir="ltr">
                            {e.accountCode}: {e.side} {e.amount} {e.assetType}
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

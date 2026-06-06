'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Card,
  Input,
  Label,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@talashim/ui';
import {
  cancelTradeOrder,
  fetchSettlementQueue,
  fetchSettlementSummary,
  settleTradeOrder,
} from '../api/trading-admin-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { AdminSubnavLinks } from '@/features/admin/components/admin-subnav-links';
import { TradingPageShell } from './trading-page-shell';
import {
  formatGram,
  formatToman,
  selectFieldClass,
  TRADE_SIDE_FA,
  TRADE_STATUS_FA,
} from '../lib/labels';

export function SettlementPanel() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('PENDING');
  const [search, setSearch] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  const summaryQuery = useQuery({
    queryKey: adminQueryKeys.trading.settlementSummary,
    queryFn: fetchSettlementSummary,
  });

  const queueQuery = useQuery({
    queryKey: adminQueryKeys.trading.settlementQueue(page, status, search),
    queryFn: () =>
      fetchSettlementQueue({
        page,
        status: status || undefined,
        search: search || undefined,
      }),
  });

  const settleMutation = useMutation({
    mutationFn: settleTradeOrder,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'trading'] });
      setActiveOrderId(null);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => cancelTradeOrder(id, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'trading'] });
      setActiveOrderId(null);
      setCancelReason('');
    },
  });

  const kpis = summaryQuery.data;

  return (
    <TradingPageShell routeId="trading.settlement">
      <AdminSubnavLinks
        links={[
          { href: '/trading/history', label: 'همه معاملات' },
          { href: '/trading/buy-orders', label: 'خرید' },
          { href: '/trading/sell-orders', label: 'فروش' },
          { href: '/trading/settlement', label: 'تسویه' },
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-[var(--border-subtle)] bg-[var(--card)] p-4">
          <p className="text-xs text-muted">در انتظار تسویه</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--warning)]">
            {summaryQuery.isLoading ? '…' : (kpis?.pendingCount ?? 0)}
          </p>
        </Card>
        <Card className="border-[var(--border-subtle)] bg-[var(--card)] p-4">
          <p className="text-xs text-muted">ناموفق</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--error)]">
            {summaryQuery.isLoading ? '…' : (kpis?.failedCount ?? 0)}
          </p>
        </Card>
        <Card className="border-[var(--border-subtle)] bg-[var(--card)] p-4">
          <p className="text-xs text-muted">تکمیل‌شده امروز</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--success)]">
            {summaryQuery.isLoading ? '…' : (kpis?.filledTodayCount ?? 0)}
          </p>
        </Card>
      </div>

      <FilterBar>
        <div className="min-w-[200px] flex-1">
          <Label>جستجو</Label>
          <Input
            className="mt-1"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="شماره سفارش یا کاربر"
          />
        </div>
        <div>
          <Label>وضعیت صف</Label>
          <select
            className={selectFieldClass}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="PENDING">در انتظار</option>
            <option value="FAILED">ناموفق</option>
            <option value="">همه</option>
          </select>
        </div>
      </FilterBar>

      <Card className="overflow-hidden border-[var(--border-subtle)] bg-[var(--card)] p-0">
        {queueQuery.isLoading ? (
          <Skeleton className="m-6 h-64" />
        ) : queueQuery.isError ? (
          <p className="p-6 text-[var(--error)]">بارگذاری صف تسویه ناموفق بود.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>شماره</TableHead>
                <TableHead>کاربر</TableHead>
                <TableHead>سمت</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>مقدار</TableHead>
                <TableHead>خالص</TableHead>
                <TableHead>علت خطا</TableHead>
                <TableHead>عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queueQuery.data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted">
                    موردی در صف تسویه نیست.
                  </TableCell>
                </TableRow>
              ) : (
                queueQuery.data?.items.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.orderNumber}</TableCell>
                    <TableCell>{order.user.fullName}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          order.side === 'BUY'
                            ? 'bg-[var(--success-bg)] text-[var(--success)]'
                            : 'bg-[var(--error-bg)] text-[var(--error)]'
                        }
                      >
                        {TRADE_SIDE_FA[order.side] ?? order.side}
                      </Badge>
                    </TableCell>
                    <TableCell>{TRADE_STATUS_FA[order.status] ?? order.status}</TableCell>
                    <TableCell>{formatGram(order.quantityGram)}</TableCell>
                    <TableCell>{formatToman(order.netRial)}</TableCell>
                    <TableCell className="max-w-[160px] truncate text-xs text-muted">
                      {order.failureReason ?? '—'}
                    </TableCell>
                    <TableCell>
                      {order.status === 'PENDING' ? (
                        <div className="flex flex-col gap-2">
                          <Button
                            className="h-8 px-3 text-xs"
                            disabled={settleMutation.isPending}
                            onClick={() => settleMutation.mutate(order.id)}
                          >
                            تسویه
                          </Button>
                          <Button
                            variant="outline"
                            className="h-8 px-3 text-xs"
                            onClick={() =>
                              setActiveOrderId(activeOrderId === order.id ? null : order.id)
                            }
                          >
                            لغو
                          </Button>
                          {activeOrderId === order.id ? (
                            <div className="space-y-1">
                              <Input
                                className="h-8 text-xs"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="دلیل لغو (حداقل ۳ کاراکتر)"
                              />
                              <Button
                                variant="ghost"
                                className="h-8 px-3 text-xs text-[var(--error)]"
                                disabled={
                                  cancelMutation.isPending || cancelReason.trim().length < 3
                                }
                                onClick={() =>
                                  cancelMutation.mutate({
                                    id: order.id,
                                    reason: cancelReason.trim(),
                                  })
                                }
                              >
                                تأیید لغو
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {(settleMutation.isError || cancelMutation.isError) && (
        <p className="text-sm text-[var(--error)]">عملیات تسویه یا لغو ناموفق بود.</p>
      )}

      {queueQuery.data ? (
        <PaginationBar
          page={queueQuery.data.page}
          total={queueQuery.data.total}
          limit={queueQuery.data.limit}
          onPageChange={setPage}
        />
      ) : null}
    </TradingPageShell>
  );
}

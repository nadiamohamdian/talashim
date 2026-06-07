'use client';

import { formatPersianDateTime } from '@/shared/lib/format-date';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Badge,
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
} from '@sadafgold/ui';
import { fetchAdminOrders } from '../api/commerce-api';
import { useAdminAuthStore } from '@/features/auth/model/admin-auth-store';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { AdminApiError } from '@/shared/ui/admin-api-error';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { PersianDatePicker } from '@/shared/ui/persian-date-picker';
import { CommercePageShell } from './commerce-page-shell';
import { formatToman, ORDER_STATUS_FA, PAYMENT_STATUS_FA, selectFieldClass } from '../lib/labels';

const statusBadge: Record<string, string> = {
  PENDING: 'bg-[var(--warning-bg)] text-[var(--warning-foreground)] border-[var(--warning-border)]',
  CONFIRMED: 'bg-blue-50 text-blue-800',
  PAID: 'bg-[var(--success-bg)] text-[var(--success)]',
  CANCELLED: 'bg-[var(--surface)] text-[var(--muted-foreground)]',
};

const paymentBadge: Record<string, string> = {
  PENDING: 'bg-[var(--warning-bg)] text-[var(--warning-foreground)] border-[var(--warning-border)]',
  AUTHORIZED: 'bg-blue-50 text-blue-800',
  PAID: 'bg-[var(--success-bg)] text-[var(--success)]',
  FAILED: 'bg-[var(--error-bg)] text-[var(--error)]',
};

export function OrdersListPanel() {
  const accessToken = useAdminAuthStore((s) => s.accessToken);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: adminQueryKeys.commerce.orders(page, search, status, from, to),
    queryFn: () =>
      fetchAdminOrders({
        page,
        search: search || undefined,
        status: status || undefined,
        from: from || undefined,
        to: to || undefined,
      }),
    enabled: Boolean(accessToken),
  });

  return (
    <CommercePageShell routeId="orders.list">
      <FilterBar>
        <div className="min-w-[200px] flex-1">
          <Label>جستجو</Label>
          <Input className="mt-1" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="شماره سفارش یا کاربر" />
        </div>
        <div>
          <Label>وضعیت</Label>
          <select className={selectFieldClass} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">همه</option>
            {Object.entries(ORDER_STATUS_FA).map(([k, l]) => (
              <option key={k} value={k}>{l}</option>
            ))}
          </select>
        </div>
        <div className="min-w-[220px]">
          <PersianDatePicker
            label="از"
            value={from}
            valueFormat="iso"
            onChange={(value) => {
              setFrom(value);
              setPage(1);
            }}
          />
        </div>
        <div className="min-w-[220px]">
          <PersianDatePicker
            label="تا"
            value={to}
            valueFormat="iso"
            endOfDay
            onChange={(value) => {
              setTo(value);
              setPage(1);
            }}
          />
        </div>
      </FilterBar>

      <Card className="overflow-hidden border-[var(--border-subtle)] bg-[var(--card)] p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-64" />
        ) : isError ? (
          <AdminApiError
            title="بارگذاری سفارش‌ها ناموفق بود."
            error={error}
            onRetry={() => void refetch()}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>شماره</TableHead>
                <TableHead>کاربر</TableHead>
                <TableHead>اقلام</TableHead>
                <TableHead>جمع</TableHead>
                <TableHead>بیمه</TableHead>
                <TableHead>وضعیت سفارش</TableHead>
                <TableHead>وضعیت پرداخت</TableHead>
                <TableHead>زمان</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted">
                    سفارشی یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link href={`/orders/${order.id}`} className="font-mono text-xs text-gold-dark hover:underline">
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{order.user?.fullName ?? 'مهمان'}</TableCell>
                    <TableCell>{order.itemCount}</TableCell>
                    <TableCell>{formatToman(order.totalToman)}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          order.isInsured
                            ? 'bg-[var(--success-bg)] text-[var(--success)]'
                            : 'bg-[var(--surface)] text-[var(--muted-foreground)]'
                        }
                      >
                        {order.isInsured ? '✅ بیمه شده' : '❌ بدون بیمه'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusBadge[order.status]}>{ORDER_STATUS_FA[order.status] ?? order.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {order.paymentStatus ? (
                        <Badge className={paymentBadge[order.paymentStatus]}>
                          {PAYMENT_STATUS_FA[order.paymentStatus] ?? order.paymentStatus}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted">بدون پرداخت</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted">
                      {formatPersianDateTime(order.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {data ? (
        <PaginationBar page={data.page} total={data.total} limit={data.limit} onPageChange={setPage} />
      ) : null}
    </CommercePageShell>
  );
}

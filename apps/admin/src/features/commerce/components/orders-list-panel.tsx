'use client';

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
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { CommercePageShell } from './commerce-page-shell';
import { formatToman, ORDER_STATUS_FA, selectFieldClass } from '../lib/labels';

const statusBadge: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-900',
  CONFIRMED: 'bg-blue-50 text-blue-800',
  PAID: 'bg-emerald-50 text-emerald-800',
  CANCELLED: 'bg-stone-100 text-stone-600',
};

export function OrdersListPanel() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.commerce.orders(page, search, status, from, to),
    queryFn: () =>
      fetchAdminOrders({
        page,
        search: search || undefined,
        status: status || undefined,
        from: from || undefined,
        to: to || undefined,
      }),
  });

  return (
    <CommercePageShell routeId="orders.list">
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
          <Label>وضعیت</Label>
          <select
            className={selectFieldClass}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">همه</option>
            {Object.entries(ORDER_STATUS_FA).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>از</Label>
          <Input
            className="mt-1"
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div>
          <Label>تا</Label>
          <Input
            className="mt-1"
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </FilterBar>

      <Card className="overflow-hidden border-border bg-white p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-64" />
        ) : isError ? (
          <p className="p-6 text-rose-600">بارگذاری سفارش‌ها ناموفق بود.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>شماره</TableHead>
                <TableHead>کاربر</TableHead>
                <TableHead>اقلام</TableHead>
                <TableHead>جمع</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>زمان</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-stone-500">
                    سفارشی یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link
                        href={`/orders/${order.id}`}
                        className="font-mono text-xs text-gold-dark hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{order.user?.fullName ?? 'مهمان'}</TableCell>
                    <TableCell>{order.itemCount}</TableCell>
                    <TableCell>{formatToman(order.totalToman)}</TableCell>
                    <TableCell>
                      <Badge className={statusBadge[order.status]}>
                        {ORDER_STATUS_FA[order.status] ?? order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-stone-500">
                      {new Date(order.createdAt).toLocaleString('fa-IR')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {data ? (
        <PaginationBar
          page={data.page}
          total={data.total}
          limit={data.limit}
          onPageChange={setPage}
        />
      ) : null}
    </CommercePageShell>
  );
}

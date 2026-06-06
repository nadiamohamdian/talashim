'use client';

import { formatPersianDateTime } from '@/shared/lib/format-date';

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
} from '@talashim/ui';
import { fetchTradingOrders } from '../api/trading-admin-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { PersianDatePicker } from '@/shared/ui/persian-date-picker';
import { AdminSubnavLinks } from '@/features/admin/components/admin-subnav-links';
import { TradingPageShell } from './trading-page-shell';
import {
  formatGram,
  formatToman,
  selectFieldClass,
  TRADE_SIDE_FA,
  TRADE_STATUS_FA,
} from '../lib/labels';

interface TradeOrdersPanelProps {
  routeId: string;
  fixedSide?: 'BUY' | 'SELL';
  showStatusFilter?: boolean;
  showDateFilter?: boolean;
}

export function TradeOrdersPanel({
  routeId,
  fixedSide,
  showStatusFilter = false,
  showDateFilter = false,
}: TradeOrdersPanelProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const side = fixedSide ?? '';

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.trading.orders(page, side, status, search, from, to),
    queryFn: () =>
      fetchTradingOrders({
        page,
        side: side || undefined,
        status: status || undefined,
        search: search || undefined,
        from: from || undefined,
        to: to || undefined,
      }),
  });

  return (
    <TradingPageShell routeId={routeId}>
      <AdminSubnavLinks
        links={[
          { href: '/trading/history', label: 'همه معاملات' },
          { href: '/trading/buy-orders', label: 'خرید' },
          { href: '/trading/sell-orders', label: 'فروش' },
          { href: '/trading/settlement', label: 'تسویه' },
        ]}
      />

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
            placeholder="شماره سفارش، ایمیل یا نام"
          />
        </div>
        {showStatusFilter ? (
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
              {Object.entries(TRADE_STATUS_FA).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        {showDateFilter ? (
          <>
            <div className="min-w-[220px]">
              <PersianDatePicker
                label="از تاریخ"
                value={from}
                onChange={(value) => {
                  setFrom(value);
                  setPage(1);
                }}
              />
            </div>
            <div className="min-w-[220px]">
              <PersianDatePicker
                label="تا تاریخ"
                value={to}
                onChange={(value) => {
                  setTo(value);
                  setPage(1);
                }}
              />
            </div>
          </>
        ) : null}
      </FilterBar>

      <Card className="overflow-hidden border-[var(--border-subtle)] bg-[var(--card)] p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-64" />
        ) : isError ? (
          <p className="p-6 text-[var(--error)]">بارگذاری سفارش‌ها ناموفق بود.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>شماره</TableHead>
                <TableHead>کاربر</TableHead>
                {!fixedSide ? <TableHead>سمت</TableHead> : null}
                <TableHead>وضعیت</TableHead>
                <TableHead>مقدار</TableHead>
                <TableHead>قیمت واحد</TableHead>
                <TableHead>خالص</TableHead>
                <TableHead>کارمزد</TableHead>
                <TableHead>زمان</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={fixedSide ? 8 : 9}
                    className="py-8 text-center text-muted"
                  >
                    سفارشی یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.orderNumber}</TableCell>
                    <TableCell>
                      <div className="font-medium">{order.user.fullName}</div>
                      <div className="text-xs text-muted">{order.user.email}</div>
                    </TableCell>
                    {!fixedSide ? (
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
                    ) : null}
                    <TableCell>{TRADE_STATUS_FA[order.status] ?? order.status}</TableCell>
                    <TableCell>{formatGram(order.quantityGram)}</TableCell>
                    <TableCell>{formatToman(order.unitPriceToman)}</TableCell>
                    <TableCell>{formatToman(order.netRial)}</TableCell>
                    <TableCell>{formatToman(order.commissionRial)}</TableCell>
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
        <PaginationBar
          page={data.page}
          total={data.total}
          limit={data.limit}
          onPageChange={setPage}
        />
      ) : null}
    </TradingPageShell>
  );
}

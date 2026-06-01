'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { fetchTradingOrders } from '../api/trading-admin-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
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
  showSideFilter?: boolean;
}

export function TradeOrdersPanel({
  routeId,
  fixedSide,
  showStatusFilter = false,
  showDateFilter = false,
  showSideFilter = false,
}: TradeOrdersPanelProps) {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sideFilter, setSideFilter] = useState('');

  useEffect(() => {
    const fromUrl = searchParams.get('side');
    if (fromUrl === 'BUY' || fromUrl === 'SELL') {
      setSideFilter(fromUrl);
    }
  }, [searchParams]);

  const side = fixedSide ?? sideFilter;

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
        {showSideFilter && !fixedSide ? (
          <div>
            <Label>سمت</Label>
            <select
              className={selectFieldClass}
              value={sideFilter}
              onChange={(e) => {
                setSideFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">همه</option>
              <option value="BUY">خرید</option>
              <option value="SELL">فروش</option>
            </select>
          </div>
        ) : null}
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
            <div>
              <Label>از تاریخ</Label>
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
              <Label>تا تاریخ</Label>
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
          </>
        ) : null}
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
                    className="py-8 text-center text-stone-500"
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
                      <div className="text-xs text-stone-500">{order.user.email}</div>
                    </TableCell>
                    {!fixedSide ? (
                      <TableCell>
                        <Badge
                          className={
                            order.side === 'BUY'
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-rose-50 text-rose-800'
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
    </TradingPageShell>
  );
}

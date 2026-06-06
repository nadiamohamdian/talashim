'use client';

import { formatPersianDateTime, formatPersianDate } from '@/shared/lib/format-date';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Label, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@talashim/ui';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fetchAdminPriceHistory } from '../api/pricing-admin-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { PricingPageShell } from './pricing-page-shell';
import { formatRial, PRICE_SOURCE_FA, selectFieldClass } from '../lib/labels';

function defaultFrom() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().slice(0, 10);
}

function defaultTo() {
  return new Date().toISOString().slice(0, 10);
}

export function HistoryPricingPanel() {
  const [symbol] = useState('XAU-IRR');
  const [karat, setKarat] = useState(18);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.pricing.history(symbol, karat, from, to),
    queryFn: () =>
      fetchAdminPriceHistory({
        symbol,
        karat,
        from,
        to,
        limit: 200,
      }),
  });

  const chartData = useMemo(() => {
    if (!data?.items.length) {
      return [];
    }
    return [...data.items]
      .reverse()
      .map((row) => ({
        label: formatPersianDate(row.recordedAt),
        price: Number(row.pricePerGram),
      }));
  }, [data?.items]);

  return (
    <PricingPageShell routeId="pricing.history">
      <div className="flex flex-wrap gap-4">
        <div>
          <Label>از تاریخ</Label>
          <input
            type="date"
            className={selectFieldClass}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div>
          <Label>تا تاریخ</Label>
          <input
            type="date"
            className={selectFieldClass}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div>
          <Label>عیار</Label>
          <select
            className={selectFieldClass}
            value={karat}
            onChange={(e) => setKarat(Number(e.target.value))}
          >
            <option value={18}>۱۸</option>
            <option value={24}>۲۴</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isError ? (
        <p className="text-rose-600">بارگذاری تاریخچه ناموفق بود.</p>
      ) : (
        <>
          <Card className="border-border bg-white p-4">
            <p className="mb-2 text-sm font-medium text-stone-900">
              روند قیمت — {data?.total ?? 0} رکورد
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => formatRial(Number(v))} />
                  <Line type="monotone" dataKey="price" stroke="#b8860b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="overflow-hidden border-border bg-white p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>زمان</TableHead>
                  <TableHead>گرم</TableHead>
                  <TableHead>خرید</TableHead>
                  <TableHead>فروش</TableHead>
                  <TableHead>منبع</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-xs">
                      {formatPersianDateTime(row.recordedAt)}
                    </TableCell>
                    <TableCell>{formatRial(row.pricePerGram)}</TableCell>
                    <TableCell>{formatRial(row.buyPrice)}</TableCell>
                    <TableCell>{formatRial(row.sellPrice)}</TableCell>
                    <TableCell className="text-xs">
                      {row.providerName} ({PRICE_SOURCE_FA[row.source] ?? row.source})
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </PricingPageShell>
  );
}

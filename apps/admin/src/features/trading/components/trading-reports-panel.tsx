'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Badge,
  Label,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@sadafgold/ui';
import { ReportBreakdownBars } from '@/features/reports/components/report-breakdown-bars';
import { ReportDateFilter } from '@/features/reports/components/report-date-filter';
import { ReportKpiGrid } from '@/features/reports/components/report-kpi-grid';
import { ReportLineChart } from '@/features/reports/components/report-line-chart';
import { defaultReportFrom, defaultReportTo } from '@/features/reports/lib/date-range';
import {
  formatGram,
  formatToman,
  TRADE_SIDE_FA,
  TRADE_STATUS_FA,
} from '@/features/reports/lib/format';
import { fetchTradingSectionReport } from '../api/trading-admin-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { TradingPageShell } from './trading-page-shell';
import { selectFieldClass } from '../lib/labels';

export function TradingReportsPanel() {
  const [from, setFrom] = useState(defaultReportFrom);
  const [to, setTo] = useState(defaultReportTo);
  const [side, setSide] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.trading.reports(page, from, to, side, status),
    queryFn: () =>
      fetchTradingSectionReport({
        page,
        from,
        to,
        side: side || undefined,
        status: status || undefined,
      }),
  });

  return (
    <TradingPageShell routeId="trading.reports">
      <ReportDateFilter
        from={from}
        to={to}
        onFromChange={(v) => {
          setFrom(v);
          setPage(1);
        }}
        onToChange={(v) => {
          setTo(v);
          setPage(1);
        }}
      >
        <div>
          <Label>سمت</Label>
          <select
            className={selectFieldClass}
            value={side}
            onChange={(e) => {
              setSide(e.target.value);
              setPage(1);
            }}
          >
            <option value="">همه</option>
            <option value="BUY">خرید</option>
            <option value="SELL">فروش</option>
          </select>
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
            {Object.entries(TRADE_STATUS_FA).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </ReportDateFilter>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : isError || !data ? (
        <p className="text-sm text-rose-600">بارگذاری گزارش معاملات ناموفق بود.</p>
      ) : (
        <>
          <ReportKpiGrid kpis={data.summary.kpis} />
          <div className="grid gap-6 lg:grid-cols-2">
            <ReportLineChart title="معاملات تکمیل‌شده روزانه" data={data.summary.dailySeries} />
            <div className="space-y-6">
              <ReportBreakdownBars
                title="بر اساس سمت"
                rows={data.summary.bySide}
                showAmount
                labelMap={TRADE_SIDE_FA}
              />
              <ReportBreakdownBars
                title="بر اساس وضعیت"
                rows={data.summary.byStatus}
                labelMap={TRADE_STATUS_FA}
              />
            </div>
          </div>

          <div className="card-luxury overflow-hidden p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>شماره</TableHead>
                  <TableHead>کاربر</TableHead>
                  <TableHead>سمت</TableHead>
                  <TableHead>گرم</TableHead>
                  <TableHead>خالص (ریال)</TableHead>
                  <TableHead>کارمزد</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>زمان</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">{row.orderNumber}</TableCell>
                    <TableCell>{row.user.email}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          row.side === 'BUY'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-rose-50 text-rose-800'
                        }
                      >
                        {TRADE_SIDE_FA[row.side] ?? row.side}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatGram(row.quantityGram)}</TableCell>
                    <TableCell>{formatToman(row.netRial)}</TableCell>
                    <TableCell>{formatToman(row.commissionRial)}</TableCell>
                    <TableCell>{TRADE_STATUS_FA[row.status] ?? row.status}</TableCell>
                    <TableCell className="text-xs text-stone-500">
                      {new Date(row.createdAt).toLocaleString('fa-IR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <PaginationBar
            page={data.page}
            total={data.total}
            limit={data.limit}
            onPageChange={setPage}
          />
        </>
      )}
    </TradingPageShell>
  );
}

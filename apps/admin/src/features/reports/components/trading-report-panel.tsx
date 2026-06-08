'use client';

import { formatPersianDateTime } from '@/shared/lib/format-date';

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
} from '@talashim/ui';
import { fetchTradingReport } from '../api/reports-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { ReportPageShell } from './report-page-shell';
import { ReportKpiGrid } from './report-kpi-grid';
import { ReportBreakdownBars } from './report-breakdown-bars';
import { ReportLineChart } from './report-line-chart';
import { ReportDateFilter } from './report-date-filter';
import { defaultReportFrom, defaultReportTo } from '../lib/date-range';
import { formatGram, formatToman, TRADE_SIDE_FA, TRADE_STATUS_FA } from '../lib/format';

const selectClass =
  'mt-1 flex h-11 w-full min-w-[140px] rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--card)] px-3 text-sm';

export function TradingReportPanel() {
  const [from, setFrom] = useState(defaultReportFrom);
  const [to, setTo] = useState(defaultReportTo);
  const [side, setSide] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.reports.trading(page, from, to, side, status),
    queryFn: () =>
      fetchTradingReport({
        page,
        from,
        to,
        side: side || undefined,
        status: status || undefined,
      }),
  });

  return (
    <ReportPageShell routeId="reports.trading">
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
            className={selectClass}
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
            className={selectClass}
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
        <Skeleton className="h-64 w-full rounded-[var(--radius-xl)]" />
      ) : isError || !data ? (
        <p className="text-sm text-[var(--error)]">بارگذاری گزارش معاملات ناموفق بود.</p>
      ) : (
        <>
          <ReportKpiGrid kpis={data.summary.kpis} />
          <div className="grid gap-6 lg:grid-cols-2">
            <ReportLineChart
              title="معاملات تکمیل‌شده روزانه"
              data={data.summary.dailySeries}
            />
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
                  <TableHead>خالص (تومان)</TableHead>
                  <TableHead>کارمزد (تومان)</TableHead>
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
                            ? 'bg-[var(--success-bg)] text-[var(--success)]'
                            : 'bg-[var(--error-bg)] text-[var(--error)]'
                        }
                      >
                        {TRADE_SIDE_FA[row.side] ?? row.side}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatGram(row.quantityGram)}</TableCell>
                    <TableCell>{formatToman(row.netRial)}</TableCell>
                    <TableCell>{formatToman(row.commissionRial)}</TableCell>
                    <TableCell>{TRADE_STATUS_FA[row.status] ?? row.status}</TableCell>
                    <TableCell className="text-xs text-muted">
                      {formatPersianDateTime(row.createdAt)}
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
    </ReportPageShell>
  );
}

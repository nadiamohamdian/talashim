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
import { fetchFinancialReport } from '../api/reports-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { ReportPageShell } from './report-page-shell';
import { ReportKpiGrid } from './report-kpi-grid';
import { ReportBreakdownBars } from './report-breakdown-bars';
import { ReportLineChart } from './report-line-chart';
import { ReportDateFilter } from './report-date-filter';
import { defaultReportFrom, defaultReportTo } from '../lib/date-range';

const selectClass =
  'mt-1 flex h-11 w-full min-w-[160px] rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--card)] px-3 text-sm';

const TX_TYPE_FA: Record<string, string> = {
  DEPOSIT: 'واریز',
  WITHDRAWAL: 'برداشت',
  TRANSFER: 'انتقال',
  CONVERSION: 'تبدیل',
  TRADE_BUY: 'خرید طلا',
  TRADE_SELL: 'فروش طلا',
  ADJUSTMENT: 'تعدیل',
  FEE: 'کارمزد',
};

export function FinancialReportPanel() {
  const [from, setFrom] = useState(defaultReportFrom);
  const [to, setTo] = useState(defaultReportTo);
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.reports.financial(page, from, to, type),
    queryFn: () =>
      fetchFinancialReport({
        page,
        from,
        to,
        type: type || undefined,
      }),
  });

  return (
    <ReportPageShell routeId="reports.financial">
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
          <Label>نوع تراکنش</Label>
          <select
            className={selectClass}
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">همه</option>
            {Object.entries(TX_TYPE_FA).map(([key, label]) => (
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
        <p className="text-sm text-[var(--error)]">بارگذاری گزارش مالی ناموفق بود.</p>
      ) : (
        <>
          <ReportKpiGrid kpis={data.summary.kpis} />
          <div className="grid gap-6 lg:grid-cols-2">
            <ReportLineChart
              title="تراکنش‌های ثبت‌شده روزانه"
              data={data.summary.dailySeries}
            />
            <div className="space-y-6">
              <ReportBreakdownBars
                title="بر اساس نوع"
                rows={data.summary.byType}
                labelMap={TX_TYPE_FA}
              />
              <ReportBreakdownBars title="بر اساس وضعیت" rows={data.summary.byStatus} />
            </div>
          </div>

          <div className="card-luxury overflow-hidden p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>مرجع</TableHead>
                  <TableHead>نوع</TableHead>
                  <TableHead>کاربر</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>توضیح</TableHead>
                  <TableHead>زمان</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-mono text-xs">{tx.reference}</TableCell>
                    <TableCell>
                      <Badge className="bg-[var(--surface)] text-[var(--muted-foreground)]">
                        {TX_TYPE_FA[tx.type] ?? tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{tx.user?.email ?? '—'}</TableCell>
                    <TableCell>{tx.status}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-muted">
                      {tx.description ?? '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted">
                      {formatPersianDateTime(tx.createdAt)}
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

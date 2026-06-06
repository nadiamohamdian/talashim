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
import { fetchFinanceReports } from '../api/finance-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { ReportDateFilter } from '@/features/reports/components/report-date-filter';
import { ReportKpiGrid } from '@/features/reports/components/report-kpi-grid';
import { ReportBreakdownBars } from '@/features/reports/components/report-breakdown-bars';
import { ReportLineChart } from '@/features/reports/components/report-line-chart';
import { defaultReportFrom, defaultReportTo } from '@/features/reports/lib/date-range';
import { FinancePageShell } from './finance-page-shell';
import { selectFieldClass, WALLET_TX_TYPE_FA, WALLET_TX_STATUS_FA } from '../lib/labels';

export function FinanceReportsPanel() {
  const [from, setFrom] = useState(defaultReportFrom);
  const [to, setTo] = useState(defaultReportTo);
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.finance.reports(page, from, to, type),
    queryFn: () =>
      fetchFinanceReports({
        page,
        from,
        to,
        type: type || undefined,
      }),
  });

  const summary = data?.summary;

  return (
    <FinancePageShell routeId="finance.reports">
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
      />

      <div className="flex flex-wrap gap-4">
        <div>
          <Label>نوع تراکنش</Label>
          <select
            className={selectFieldClass}
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
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
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : isError ? (
        <p className="text-[var(--error)]">بارگذاری گزارش مالی ناموفق بود.</p>
      ) : summary ? (
        <>
          <ReportKpiGrid kpis={summary.kpis} />

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-[var(--border-subtle)] bg-[var(--card)] p-4">
              <p className="mb-3 text-sm font-medium">موجودی حساب‌های پلتفرم</p>
              <div className="space-y-2">
                {summary.platformBalances.map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between rounded-[var(--radius-xl)] bg-[var(--surface)] px-3 py-2 text-sm"
                  >
                    <span>{row.label}</span>
                    <span className="font-mono" dir="ltr">
                      {row.balance} {row.assetType === 'GOLD' ? 'گرم' : 'ریال'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
            <ReportBreakdownBars
              title="تراکنش‌ها بر اساس نوع"
              rows={summary.byType}
              labelMap={WALLET_TX_TYPE_FA}
            />
          </div>

          <ReportLineChart title="روند تراکنش‌های روزانه" data={summary.dailySeries} />
        </>
      ) : null}

      <Card className="mt-6 overflow-hidden border-[var(--border-subtle)] bg-[var(--card)] p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-48" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>مرجع</TableHead>
                <TableHead>کاربر</TableHead>
                <TableHead>نوع</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>زمان</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono text-xs" dir="ltr">
                    {tx.reference}
                  </TableCell>
                  <TableCell>{tx.user?.fullName ?? '—'}</TableCell>
                  <TableCell>{WALLET_TX_TYPE_FA[tx.type] ?? tx.type}</TableCell>
                  <TableCell>{WALLET_TX_STATUS_FA[tx.status] ?? tx.status}</TableCell>
                  <TableCell className="text-xs">
                    {formatPersianDateTime(tx.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
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
    </FinancePageShell>
  );
}

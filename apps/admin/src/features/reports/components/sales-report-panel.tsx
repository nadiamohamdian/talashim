'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Badge,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Label,
} from '@sadafgold/ui';
import { fetchSalesReport } from '../api/reports-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { ReportPageShell } from './report-page-shell';
import { ReportKpiGrid } from './report-kpi-grid';
import { ReportBreakdownBars } from './report-breakdown-bars';
import { ReportLineChart } from './report-line-chart';
import { ReportDateFilter } from './report-date-filter';
import { defaultReportFrom, defaultReportTo } from '../lib/date-range';
import { formatToman, ORDER_STATUS_FA } from '../lib/format';

const selectClass =
  'mt-1 flex h-11 w-full min-w-[140px] rounded-2xl border border-border bg-white px-3 text-sm';

export function SalesReportPanel() {
  const [from, setFrom] = useState(defaultReportFrom);
  const [to, setTo] = useState(defaultReportTo);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.reports.sales(page, from, to, status),
    queryFn: () =>
      fetchSalesReport({
        page,
        from,
        to,
        status: status || undefined,
      }),
  });

  return (
    <ReportPageShell routeId="reports.sales">
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
          <Label>وضعیت سفارش</Label>
          <select
            className={selectClass}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">همه</option>
            {Object.entries(ORDER_STATUS_FA).map(([key, label]) => (
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
        <p className="text-sm text-rose-600">بارگذاری گزارش فروش ناموفق بود.</p>
      ) : (
        <>
          <ReportKpiGrid kpis={data.summary.kpis} />
          <div className="grid gap-6 lg:grid-cols-2">
            <ReportLineChart
              title="روند روزانه سفارش"
              data={data.summary.dailySeries}
              valueLabel="سفارش"
              secondaryLabel="درآمد (تومان)"
            />
            <ReportBreakdownBars
              title="توزیع وضعیت"
              rows={data.summary.byStatus}
              showAmount
              labelMap={ORDER_STATUS_FA}
            />
          </div>

          <div className="card-luxury overflow-hidden p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>شماره</TableHead>
                  <TableHead>مشتری</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>اقلام</TableHead>
                  <TableHead>جمع (تومان)</TableHead>
                  <TableHead>تاریخ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-stone-500">
                      سفارشی در این بازه نیست.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.items.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">{order.orderNumber}</TableCell>
                      <TableCell>{order.user?.email ?? 'مهمان'}</TableCell>
                      <TableCell>
                        <Badge className="bg-nude-50 text-stone-700">
                          {ORDER_STATUS_FA[order.status] ?? order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.itemCount}</TableCell>
                      <TableCell>{formatToman(order.totalToman)}</TableCell>
                      <TableCell className="text-xs text-stone-500">
                        {new Date(order.createdAt).toLocaleString('fa-IR')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
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

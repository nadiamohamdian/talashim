'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
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
import { getRoleLabelFa } from '@sadafgold/shared/admin-rbac';
import { fetchUsersReport } from '../api/reports-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { ReportPageShell } from './report-page-shell';
import { ReportKpiGrid } from './report-kpi-grid';
import { ReportBreakdownBars } from './report-breakdown-bars';
import { ReportLineChart } from './report-line-chart';
import { ReportDateFilter } from './report-date-filter';
import { defaultReportFrom, defaultReportTo } from '../lib/date-range';

const selectClass =
  'mt-1 flex h-11 w-full min-w-[140px] rounded-2xl border border-border bg-white px-3 text-sm';

const KYC_FA: Record<string, string> = {
  PENDING: 'در انتظار',
  APPROVED: 'تأیید',
  REJECTED: 'رد',
};

export function UsersReportPanel() {
  const [from, setFrom] = useState(defaultReportFrom);
  const [to, setTo] = useState(defaultReportTo);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.reports.users(page, from, to, search, role),
    queryFn: () =>
      fetchUsersReport({
        page,
        from,
        to,
        search: search || undefined,
        role: role || undefined,
      }),
  });

  return (
    <ReportPageShell routeId="reports.users">
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
        <div className="min-w-[180px] flex-1">
          <Label>جستجو</Label>
          <Input
            className="mt-1"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div>
          <Label>نقش</Label>
          <select
            className={selectClass}
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
          >
            <option value="">همه</option>
            <option value="CUSTOMER">مشتری</option>
            <option value="SUPER_ADMIN">سوپر ادمین</option>
            <option value="SUPPORT">پشتیبان</option>
            <option value="ACCOUNTANT">حسابدار</option>
            <option value="EDITOR">ادیتور</option>
            <option value="WAREHOUSE">انباردار</option>
          </select>
        </div>
      </ReportDateFilter>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : isError || !data ? (
        <p className="text-sm text-rose-600">بارگذاری گزارش کاربران ناموفق بود.</p>
      ) : (
        <>
          <ReportKpiGrid kpis={data.summary.kpis} />
          <div className="grid gap-6 lg:grid-cols-2">
            <ReportLineChart
              title="ثبت‌نام روزانه"
              data={data.summary.registrationSeries}
              valueLabel="کاربر جدید"
            />
            <div className="space-y-6">
              <ReportBreakdownBars
                title="کاربران بر اساس نقش"
                rows={data.summary.byRole}
                labelMap={{
                  CUSTOMER: 'مشتری',
                  SUPER_ADMIN: 'سوپر ادمین',
                  SUPPORT: 'پشتیبان',
                  ACCOUNTANT: 'حسابدار',
                  EDITOR: 'ادیتور',
                  WAREHOUSE: 'انباردار',
                }}
              />
              <ReportBreakdownBars
                title="وضعیت KYC"
                rows={data.summary.kycByStatus}
                labelMap={KYC_FA}
              />
            </div>
          </div>

          <div className="card-luxury overflow-hidden p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نام</TableHead>
                  <TableHead>ایمیل</TableHead>
                  <TableHead>نقش</TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead>سفارش</TableHead>
                  <TableHead>عضویت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell>{getRoleLabelFa(user.role)}</TableCell>
                    <TableCell>
                      {user.kycStatus ? (KYC_FA[user.kycStatus] ?? user.kycStatus) : '—'}
                    </TableCell>
                    <TableCell>{user.orderCount}</TableCell>
                    <TableCell className="text-xs text-stone-500">
                      {new Date(user.createdAt).toLocaleDateString('fa-IR')}
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

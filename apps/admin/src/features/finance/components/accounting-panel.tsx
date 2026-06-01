'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
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
import { fetchAccountingSummary } from '../api/finance-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { FinancePageShell } from './finance-page-shell';
import { LEDGER_CATEGORY_FA, selectFieldClass } from '../lib/labels';

export function AccountingPanel() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.finance.accounting(search, category),
    queryFn: () =>
      fetchAccountingSummary({
        search: search || undefined,
        category: category || undefined,
      }),
  });

  return (
    <FinancePageShell routeId="finance.accounting">
      <FilterBar>
        <div className="min-w-[200px] flex-1">
          <Label>جستجوی حساب</Label>
          <Input
            className="mt-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="کد یا نام حساب"
          />
        </div>
        <div>
          <Label>نوع حساب</Label>
          <select
            className={selectFieldClass}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">همه</option>
            {Object.entries(LEDGER_CATEGORY_FA).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </FilterBar>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : isError ? (
        <p className="text-rose-600">بارگذاری حسابداری ناموفق بود.</p>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.kpis.map((kpi) => (
              <Card key={kpi.key} className="border-border bg-white p-4">
                <p className="text-xs text-stone-500">{kpi.label}</p>
                <p className="mt-1 text-xl font-semibold text-stone-900">{kpi.value}</p>
              </Card>
            ))}
          </div>

          {data.byCategory.length > 0 ? (
            <Card className="border-border bg-white p-4">
              <p className="mb-3 text-sm font-medium text-stone-900">تفکیک بر اساس نوع حساب</p>
              <div className="space-y-2">
                {data.byCategory.map((row) => (
                  <div
                    key={row.key}
                    className="flex items-center justify-between rounded-xl bg-nude-50 px-3 py-2 text-sm"
                  >
                    <span>{row.label}</span>
                    <span className="text-stone-600">
                      {row.count} حساب · {row.amount?.toLocaleString('fa-IR')}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          <Card className="overflow-hidden border-border bg-white p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>کد</TableHead>
                  <TableHead>نام</TableHead>
                  <TableHead>نوع</TableHead>
                  <TableHead>دارایی</TableHead>
                  <TableHead>کاربر</TableHead>
                  <TableHead>مانده</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-mono text-xs" dir="ltr">
                      {account.code}
                    </TableCell>
                    <TableCell>{account.name}</TableCell>
                    <TableCell>
                      {LEDGER_CATEGORY_FA[account.category] ?? account.category}
                    </TableCell>
                    <TableCell>{account.assetType ?? '—'}</TableCell>
                    <TableCell className="text-sm">{account.user?.fullName ?? 'سیستم'}</TableCell>
                    <TableCell className="font-mono text-sm" dir="ltr">
                      {account.balance}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      ) : null}
    </FinancePageShell>
  );
}

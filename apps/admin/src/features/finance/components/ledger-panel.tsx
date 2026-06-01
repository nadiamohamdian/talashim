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
import { fetchLedgerEntries } from '../api/finance-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { FinancePageShell } from './finance-page-shell';
import { LEDGER_SIDE_FA, selectFieldClass } from '../lib/labels';

export function LedgerPanel() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [assetType, setAssetType] = useState('');
  const [side, setSide] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.finance.ledger(page, search, assetType, side),
    queryFn: () =>
      fetchLedgerEntries({
        page,
        search: search || undefined,
        assetType: assetType || undefined,
        side: side || undefined,
      }),
  });

  return (
    <FinancePageShell routeId="finance.ledger">
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
            placeholder="کد حساب یا مرجع"
          />
        </div>
        <div>
          <Label>دارایی</Label>
          <select
            className={selectFieldClass}
            value={assetType}
            onChange={(e) => {
              setAssetType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">همه</option>
            <option value="RIAL">ریال</option>
            <option value="GOLD">طلا</option>
          </select>
        </div>
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
            <option value="DEBIT">بدهکار</option>
            <option value="CREDIT">بستانکار</option>
          </select>
        </div>
      </FilterBar>

      <Card className="overflow-hidden border-border bg-white p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-64" />
        ) : isError ? (
          <p className="p-6 text-rose-600">بارگذاری دفتر کل ناموفق بود.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>مرجع</TableHead>
                <TableHead>حساب</TableHead>
                <TableHead>سمت</TableHead>
                <TableHead>مبلغ</TableHead>
                <TableHead>کاربر</TableHead>
                <TableHead>زمان</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs" dir="ltr">
                    {row.reference}
                  </TableCell>
                  <TableCell>
                    <p className="font-mono text-xs" dir="ltr">
                      {row.accountCode}
                    </p>
                    <p className="text-xs text-stone-500">{row.accountName}</p>
                  </TableCell>
                  <TableCell>{LEDGER_SIDE_FA[row.side] ?? row.side}</TableCell>
                  <TableCell>
                    {row.amount} {row.assetType === 'GOLD' ? 'گرم' : 'ریال'}
                  </TableCell>
                  <TableCell className="text-sm">{row.user?.fullName ?? '—'}</TableCell>
                  <TableCell className="text-xs">
                    {new Date(row.createdAt).toLocaleString('fa-IR')}
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

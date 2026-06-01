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
import { fetchWallets } from '../api/finance-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { FinancePageShell } from './finance-page-shell';
import { formatToman } from '../lib/labels';

export function WalletsPanel() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.wallets(page, search),
    queryFn: () => fetchWallets({ search: search || undefined, page }),
  });

  return (
    <FinancePageShell routeId="finance.wallets">
      <FilterBar>
        <div className="min-w-[240px] flex-1">
          <Label>جستجوی کاربر</Label>
          <Input
            className="mt-1"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="ایمیل یا نام"
          />
        </div>
      </FilterBar>

      <Card className="overflow-hidden border-border bg-white p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-64" />
        ) : isError ? (
          <p className="p-6 text-rose-600">بارگذاری کیف پول‌ها ناموفق بود.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>کاربر</TableHead>
                <TableHead>ایمیل</TableHead>
                <TableHead>نقش</TableHead>
                <TableHead>موجودی ریال</TableHead>
                <TableHead>موجودی طلا (گرم)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-stone-500">
                    کاربری یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((row) => (
                  <TableRow key={row.user.id}>
                    <TableCell className="font-medium">{row.user.fullName}</TableCell>
                    <TableCell className="text-sm text-stone-600">{row.user.email}</TableCell>
                    <TableCell className="text-xs">{row.user.role}</TableCell>
                    <TableCell>{formatToman(row.balances.rialBalance)}</TableCell>
                    <TableCell>{Number(row.balances.goldBalanceGram).toFixed(4)}</TableCell>
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
    </FinancePageShell>
  );
}

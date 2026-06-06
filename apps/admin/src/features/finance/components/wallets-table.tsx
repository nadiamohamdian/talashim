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
import { fetchWallets } from '@/features/admin/api/admin-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PageHeader } from '@/widgets/admin/page-header';
import { PaginationBar } from '@/widgets/admin/pagination-bar';

export function WalletsTable() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: adminQueryKeys.wallets(page, search),
    queryFn: () => fetchWallets({ search: search || undefined, page }),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="کیف پول‌ها" description="GET /admin/wallets" availability="live" />
      <FilterBar>
        <div className="min-w-[240px] flex-1">
          <Label>جستجوی کاربر</Label>
          <Input
            className="mt-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </FilterBar>
      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-64" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>کاربر</TableHead>
                <TableHead>ایمیل</TableHead>
                <TableHead>ریال</TableHead>
                <TableHead>طلا (گرم)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((row) => (
                <TableRow key={row.user.id}>
                  <TableCell>{row.user.fullName}</TableCell>
                  <TableCell>{row.user.email}</TableCell>
                  <TableCell>{Number(row.balances.rialBalance).toLocaleString('fa-IR')}</TableCell>
                  <TableCell>{row.balances.goldBalanceGram}</TableCell>
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
    </div>
  );
}

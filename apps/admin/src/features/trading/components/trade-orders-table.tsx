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
} from '@sadafgold/ui';
import { fetchTradeOrders } from '@/features/admin/api/admin-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PageHeader } from '@/widgets/admin/page-header';
import { PaginationBar } from '@/widgets/admin/pagination-bar';

interface TradeOrdersTableProps {
  title: string;
  description: string;
  defaultSide?: 'BUY' | 'SELL';
}

export function TradeOrdersTable({ title, description, defaultSide }: TradeOrdersTableProps) {
  const [page, setPage] = useState(1);
  const side = defaultSide ?? '';

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.trades(page, side),
    queryFn: () => fetchTradeOrders({ page, side: side || undefined }),
  });

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} availability="live" />

      <FilterBar>
        <div>
          <Label>سمت معامله</Label>
          <p className="mt-1 text-sm text-muted">
            {defaultSide === 'BUY' ? 'خرید' : defaultSide === 'SELL' ? 'فروش' : 'همه'}
          </p>
        </div>
      </FilterBar>

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-64" />
        ) : isError ? (
          <p className="p-6 text-[var(--error)]">بارگذاری معاملات ناموفق بود.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>شماره</TableHead>
                <TableHead>کاربر</TableHead>
                <TableHead>سمت</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>مقدار (گرم)</TableHead>
                <TableHead>مبلغ خالص (تومان)</TableHead>
                <TableHead>زمان</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.orderNumber}</TableCell>
                  <TableCell>{order.user.fullName}</TableCell>
                  <TableCell>{order.side}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>{order.quantityGram}</TableCell>
                  <TableCell>{Number(order.netRial).toLocaleString('fa-IR')} تومان</TableCell>
                  <TableCell className="text-xs">
                    {formatPersianDateTime(order.createdAt)}
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
    </div>
  );
}

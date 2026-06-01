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
import { fetchInventoryHistory } from '../api/commerce-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { CatalogPageShell } from './catalog-page-shell';
import { INVENTORY_MOVEMENT_FA, selectFieldClass } from '../lib/labels';

export function InventoryHistoryPanel() {
  const [page, setPage] = useState(1);
  const [productId, setProductId] = useState('');
  const [type, setType] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.commerce.inventoryHistory(page, productId, type),
    queryFn: () =>
      fetchInventoryHistory({
        page,
        productId: productId || undefined,
        type: type || undefined,
      }),
  });

  return (
    <CatalogPageShell routeId="inventory.history">
      <FilterBar>
        <div className="min-w-[200px] flex-1">
          <Label>شناسه محصول</Label>
          <Input
            className="mt-1"
            value={productId}
            onChange={(e) => {
              setProductId(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div>
          <Label>نوع حرکت</Label>
          <select
            className={selectFieldClass}
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">همه</option>
            {Object.entries(INVENTORY_MOVEMENT_FA).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </FilterBar>

      <Card className="overflow-hidden border-border bg-white p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-64" />
        ) : isError ? (
          <p className="p-6 text-rose-600">بارگذاری تاریخچه ناموفق بود.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>زمان</TableHead>
                <TableHead>محصول</TableHead>
                <TableHead>نوع</TableHead>
                <TableHead>تغییر</TableHead>
                <TableHead>قبل → بعد</TableHead>
                <TableHead>اپراتور</TableHead>
                <TableHead>یادداشت</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-xs text-stone-500">
                    {new Date(row.createdAt).toLocaleString('fa-IR')}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{row.productTitle}</div>
                    <div className="font-mono text-xs text-stone-500">{row.productSku}</div>
                  </TableCell>
                  <TableCell>{INVENTORY_MOVEMENT_FA[row.type] ?? row.type}</TableCell>
                  <TableCell
                    className={row.quantityDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'}
                  >
                    {row.quantityDelta > 0 ? `+${row.quantityDelta}` : row.quantityDelta}
                  </TableCell>
                  <TableCell className="text-xs">
                    {row.quantityBefore} → {row.quantityAfter}
                  </TableCell>
                  <TableCell>{row.actorName ?? '—'}</TableCell>
                  <TableCell className="max-w-[120px] truncate text-xs">
                    {row.note ?? '—'}
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
    </CatalogPageShell>
  );
}

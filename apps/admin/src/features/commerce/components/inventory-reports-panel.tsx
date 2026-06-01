'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Badge,
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
import { fetchInventorySectionReport } from '../api/commerce-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { ReportBreakdownBars } from '@/features/reports/components/report-breakdown-bars';
import { ReportKpiGrid } from '@/features/reports/components/report-kpi-grid';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { CatalogPageShell } from './catalog-page-shell';
import { PRODUCT_CATEGORY_FA, selectFieldClass } from '../lib/labels';

export function InventoryReportsPanel() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.commerce.inventoryReports(page, search, category, lowStockOnly),
    queryFn: () =>
      fetchInventorySectionReport({
        page,
        search: search || undefined,
        category: category || undefined,
        lowStockOnly,
      }),
  });

  return (
    <CatalogPageShell routeId="inventory.reports">
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
          />
        </div>
        <div>
          <Label>دسته</Label>
          <select
            className={selectFieldClass}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">همه</option>
            {Object.entries(PRODUCT_CATEGORY_FA).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => {
              setLowStockOnly(e.target.checked);
              setPage(1);
            }}
          />
          کم‌موجودی
        </label>
      </FilterBar>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : isError || !data ? (
        <p className="text-rose-600">بارگذاری گزارش ناموفق بود.</p>
      ) : (
        <>
          <ReportKpiGrid kpis={data.summary.kpis} />
          <ReportBreakdownBars
            title="توزیع دسته‌ها"
            rows={data.summary.byCategory}
            labelMap={PRODUCT_CATEGORY_FA}
          />
          <div className="card-luxury overflow-hidden p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>عنوان</TableHead>
                  <TableHead>موجودی</TableHead>
                  <TableHead>رزرو</TableHead>
                  <TableHead>قابل فروش</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((row) => (
                  <TableRow key={row.productId}>
                    <TableCell className="font-mono text-xs">{row.sku}</TableCell>
                    <TableCell>{row.title}</TableCell>
                    <TableCell>{row.quantity}</TableCell>
                    <TableCell>{row.reserved}</TableCell>
                    <TableCell>
                      <Badge className={row.lowStock ? 'bg-amber-50 text-amber-900' : undefined}>
                        {row.available}
                      </Badge>
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
    </CatalogPageShell>
  );
}

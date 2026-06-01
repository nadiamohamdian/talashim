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
import { fetchInventoryReport } from '../api/reports-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { ReportPageShell } from './report-page-shell';
import { ReportKpiGrid } from './report-kpi-grid';
import { ReportBreakdownBars } from './report-breakdown-bars';
import { PRODUCT_CATEGORY_FA } from '../lib/format';

const selectClass =
  'mt-1 flex h-11 w-full min-w-[140px] rounded-2xl border border-border bg-white px-3 text-sm';

export function InventoryReportPanel() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.reports.inventory(page, search, category, lowStockOnly),
    queryFn: () =>
      fetchInventoryReport({
        page,
        search: search || undefined,
        category: category || undefined,
        lowStockOnly,
      }),
  });

  return (
    <ReportPageShell routeId="reports.inventory">
      <FilterBar>
        <div className="min-w-[200px] flex-1">
          <Label>جستجو SKU / عنوان</Label>
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
            className={selectClass}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">همه</option>
            {Object.entries(PRODUCT_CATEGORY_FA).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 pb-1 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => {
              setLowStockOnly(e.target.checked);
              setPage(1);
            }}
          />
          فقط کم‌موجود
        </label>
      </FilterBar>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : isError || !data ? (
        <p className="text-sm text-rose-600">بارگذاری گزارش موجودی ناموفق بود.</p>
      ) : (
        <>
          <ReportKpiGrid kpis={data.summary.kpis} />
          <ReportBreakdownBars
            title="موجودی بر اساس دسته"
            rows={data.summary.byCategory}
            showAmount
            labelMap={PRODUCT_CATEGORY_FA}
          />

          <div className="card-luxury overflow-hidden p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>محصول</TableHead>
                  <TableHead>دسته</TableHead>
                  <TableHead>موجودی</TableHead>
                  <TableHead>رزرو</TableHead>
                  <TableHead>قابل فروش</TableHead>
                  <TableHead>وضعیت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((row) => (
                  <TableRow key={row.productId}>
                    <TableCell className="font-mono text-xs">{row.sku}</TableCell>
                    <TableCell>{row.title}</TableCell>
                    <TableCell>{PRODUCT_CATEGORY_FA[row.category] ?? row.category}</TableCell>
                    <TableCell>{row.quantity}</TableCell>
                    <TableCell>{row.reserved}</TableCell>
                    <TableCell>{row.available}</TableCell>
                    <TableCell>
                      {row.available <= 0 ? (
                        <Badge className="bg-rose-50 text-rose-800">ناموجود</Badge>
                      ) : row.lowStock ? (
                        <Badge className="bg-amber-50 text-amber-900">کم‌موجود</Badge>
                      ) : (
                        <Badge className="bg-emerald-50 text-emerald-800">عادی</Badge>
                      )}
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

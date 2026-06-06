'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
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
} from '@talashim/ui';
import { adjustInventory, fetchInventoryStock } from '../api/commerce-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { CatalogPageShell } from './catalog-page-shell';
import { InventoryHistoryContent } from './inventory-history-panel';
import { PRODUCT_CATEGORY_FA, selectFieldClass } from '../lib/labels';

type InventoryTab = 'stock' | 'history';

const tabClass = (active: boolean) =>
  `rounded-xl px-4 py-2 text-sm font-medium transition ${
    active
      ? 'bg-stone-900 text-white shadow-sm'
      : 'bg-white text-stone-600 ring-1 ring-border hover:bg-nude-50'
  }`;

export function InventoryOverviewPanel() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<InventoryTab>('stock');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [adjustProductId, setAdjustProductId] = useState<string | null>(null);
  const [delta, setDelta] = useState('');
  const [note, setNote] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.commerce.inventory(page, search, category, lowStockOnly),
    queryFn: () =>
      fetchInventoryStock({
        page,
        search: search || undefined,
        category: category || undefined,
        lowStockOnly: lowStockOnly || undefined,
      }),
    enabled: tab === 'stock',
  });

  const adjustMutation = useMutation({
    mutationFn: () =>
      adjustInventory({
        productId: adjustProductId!,
        quantityDelta: Number(delta),
        note: note || undefined,
      }),
    onSuccess: () => {
      setAdjustProductId(null);
      setDelta('');
      setNote('');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'commerce'] });
    },
  });

  return (
    <CatalogPageShell routeId="inventory.overview">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={tabClass(tab === 'stock')} onClick={() => setTab('stock')}>
          موجودی انبار
        </button>
        <button type="button" className={tabClass(tab === 'history')} onClick={() => setTab('history')}>
          تاریخچه تغییرات
        </button>
      </div>

      {tab === 'history' ? (
        <div className="mt-4">
          <InventoryHistoryContent />
        </div>
      ) : (
        <>
          <FilterBar>
            <div className="min-w-[200px] flex-1">
              <Label>جستجو</Label>
              <Input className="mt-1" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <div>
              <Label>دسته</Label>
              <select className={selectFieldClass} value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
                <option value="">همه</option>
                {Object.entries(PRODUCT_CATEGORY_FA).map(([k, l]) => (
                  <option key={k} value={k}>{l}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 self-end pb-2 text-sm">
              <input type="checkbox" checked={lowStockOnly} onChange={(e) => { setLowStockOnly(e.target.checked); setPage(1); }} />
              فقط کم‌موجودی
            </label>
          </FilterBar>

          <Card className="overflow-hidden border-border bg-white p-0">
            {isLoading ? (
              <Skeleton className="m-6 h-64" />
            ) : isError ? (
              <p className="p-6 text-rose-600">بارگذاری موجودی ناموفق بود.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>محصول</TableHead>
                    <TableHead>موجودی</TableHead>
                    <TableHead>رزرو</TableHead>
                    <TableHead>قابل فروش</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.items.map((row) => (
                    <TableRow key={row.productId}>
                      <TableCell className="font-mono text-xs">{row.sku}</TableCell>
                      <TableCell>{row.title}</TableCell>
                      <TableCell>{row.quantity}</TableCell>
                      <TableCell>{row.reserved}</TableCell>
                      <TableCell>
                        <Badge className={row.lowStock ? 'bg-amber-50 text-amber-900' : 'bg-emerald-50 text-emerald-800'}>
                          {row.available}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          className="h-8 px-3 text-xs"
                          onClick={() => setAdjustProductId(row.productId)}
                        >
                          تعدیل
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>

          {adjustProductId ? (
            <Card className="border-border bg-white p-4">
              <h3 className="text-sm font-medium">تعدیل موجودی</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <Label>تغییر (+/-)</Label>
                  <Input className="mt-1" type="number" value={delta} onChange={(e) => setDelta(e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <Label>یادداشت</Label>
                  <Input className="mt-1" value={note} onChange={(e) => setNote(e.target.value)} />
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button className="h-8 px-3 text-xs" disabled={adjustMutation.isPending} onClick={() => adjustMutation.mutate()}>
                  ثبت تعدیل
                </Button>
                <Button variant="ghost" className="h-8 px-3 text-xs" onClick={() => setAdjustProductId(null)}>
                  بستن
                </Button>
              </div>
            </Card>
          ) : null}

          {data ? (
            <PaginationBar page={data.page} total={data.total} limit={data.limit} onPageChange={setPage} />
          ) : null}
        </>
      )}
    </CatalogPageShell>
  );
}

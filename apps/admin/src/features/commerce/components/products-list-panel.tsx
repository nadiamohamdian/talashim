'use client';

import Link from 'next/link';
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
} from '@sadafgold/ui';
import { fetchAdminProducts, deleteAdminProduct } from '../api/commerce-api';
import { getApiErrorMessage } from '@/shared/api/axios-client';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { AdminSubnavLinks } from '@/features/admin/components/admin-subnav-links';
import { CatalogPageShell } from './catalog-page-shell';
import { formatToman, PRODUCT_CATEGORY_FA, selectFieldClass } from '../lib/labels';

export function ProductsListPanel() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [lowStock, setLowStock] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: adminQueryKeys.commerce.products(page, search, category, lowStock),
    queryFn: () =>
      fetchAdminProducts({
        page,
        search: search || undefined,
        category: category || undefined,
        lowStock: lowStock || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'commerce'] }),
  });

  return (
    <CatalogPageShell
      routeId="products.list"
      actions={
        <Link href="/products/new">
          <Button className="h-10 px-4">محصول جدید</Button>
        </Link>
      }
    >
      <AdminSubnavLinks
        links={[
          { href: '/products', label: 'محصولات' },
          { href: '/inventory', label: 'موجودی' },
          { href: '/inventory/history', label: 'تاریخچه موجودی' },
          { href: '/products/videos', label: 'ویدیوها' },
        ]}
      />

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
            placeholder="عنوان یا SKU"
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
            {Object.entries(PRODUCT_CATEGORY_FA).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input
            type="checkbox"
            checked={lowStock}
            onChange={(e) => {
              setLowStock(e.target.checked);
              setPage(1);
            }}
          />
          کم‌موجودی
        </label>
      </FilterBar>

      <Card className="overflow-hidden border-border bg-white p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-64" />
        ) : isError ? (
          <p className="p-6 text-rose-600">
            بارگذاری محصولات ناموفق بود.
            {error ? (
              <span className="mt-2 block text-sm text-stone-600">{getApiErrorMessage(error)}</span>
            ) : null}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>عنوان</TableHead>
                <TableHead>دسته</TableHead>
                <TableHead>عیار</TableHead>
                <TableHead>قیمت پایه</TableHead>
                <TableHead>موجودی</TableHead>
                <TableHead>عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-stone-500">
                    محصولی یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                    <TableCell className="font-medium">{product.title}</TableCell>
                    <TableCell>{PRODUCT_CATEGORY_FA[product.category] ?? product.category}</TableCell>
                    <TableCell>{product.karat}</TableCell>
                    <TableCell>{formatToman(product.priceToman)}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          (product.inventory?.available ?? 0) > 0
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-rose-50 text-rose-800'
                        }
                      >
                        {product.inventory?.available ?? 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-2 space-x-reverse">
                      <Link
                        href={`/products/${product.slug}`}
                        className="text-xs text-gold-dark hover:underline"
                      >
                        جزئیات
                      </Link>
                      <Link
                        href={`/products/${product.slug}/edit`}
                        className="text-xs text-stone-600 hover:underline"
                      >
                        ویرایش
                      </Link>
                      <button
                        type="button"
                        className="text-xs text-rose-600 hover:underline"
                        onClick={() => {
                          if (window.confirm('حذف این محصول؟')) {
                            deleteMutation.mutate(product.id);
                          }
                        }}
                      >
                        حذف
                      </button>
                    </TableCell>
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
    </CatalogPageShell>
  );
}

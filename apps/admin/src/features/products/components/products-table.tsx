'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
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
import { fetchCatalog } from '@/lib/api/catalog.api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { ApiUnavailablePanel } from '@/widgets/admin/api-unavailable-panel';
import { API_REQUIREMENTS } from '@/shared/config/api-requirements';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PageHeader } from '@/widgets/admin/page-header';
import { PaginationBar } from '@/widgets/admin/pagination-bar';

export function ProductsTable() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.catalog(page, search, category),
    queryFn: () =>
      fetchCatalog({
        page,
        limit: 20,
        search: search || undefined,
        category: category || undefined,
      }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="مدیریت محصولات"
        description="لیست از API عمومی کاتالوگ — عملیات CRUD نیازمند admin/products است."
        availability="partial"
        actions={
          <Link
            href="/products/new"
            className="inline-flex h-11 items-center rounded-2xl border border-zinc-700 px-4 text-sm text-zinc-500"
            aria-disabled
            tabIndex={-1}
          >
            محصول جدید (API)
          </Link>
        }
      />

      <FilterBar>
        <div className="min-w-[200px] flex-1">
          <Label>جستجو</Label>
          <Input
            className="mt-1 border-zinc-700 bg-zinc-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="عنوان یا SKU"
          />
        </div>
        <div>
          <Label>دسته</Label>
          <Input
            className="mt-1 border-zinc-700 bg-zinc-900"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="ring, coin, …"
          />
        </div>
        <Button variant="secondary" onClick={() => setPage(1)}>
          اعمال
        </Button>
      </FilterBar>

      <Card className="overflow-hidden border-zinc-800 bg-zinc-900/40 p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-64" />
        ) : isError ? (
          <p className="p-6 text-rose-400">بارگذاری کاتالوگ ناموفق بود.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>عنوان</TableHead>
                <TableHead>عیار</TableHead>
                <TableHead>وزن</TableHead>
                <TableHead>قیمت</TableHead>
                <TableHead>موجودی</TableHead>
                <TableHead>عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                  <TableCell>{product.title}</TableCell>
                  <TableCell>{product.karat}</TableCell>
                  <TableCell>{product.weightGram} گرم</TableCell>
                  <TableCell>{product.priceToman.toLocaleString('fa-IR')} ت</TableCell>
                  <TableCell>
                    <Badge
                      className={product.inventory > 0 ? undefined : 'bg-rose-500/15 text-rose-300'}
                    >
                      {product.inventory}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-xs text-amber-400 hover:underline"
                    >
                      جزئیات
                    </Link>
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

      <ApiUnavailablePanel
        {...API_REQUIREMENTS.productsCreate}
        connectedNote="خواندن لیست: GET /catalog (فعال). ایجاد/ویرایش/حذف: در انتظار admin API."
      />
    </div>
  );
}

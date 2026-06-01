'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Badge, Card, Skeleton } from '@sadafgold/ui';
import { fetchAdminProductBySlug } from '../api/commerce-api';
import { CatalogPageShell } from './catalog-page-shell';
import { formatToman, PRODUCT_CATEGORY_FA } from '../lib/labels';

interface ProductDetailPanelProps {
  slug: string;
}

export function ProductDetailPanel({ slug }: ProductDetailPanelProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'commerce', 'product-slug', slug],
    queryFn: () => fetchAdminProductBySlug(slug),
  });

  return (
    <CatalogPageShell
      routeId="products.detail"
      actions={
        data ? (
          <Link href={`/products/${slug}/edit`}>
            <span className="inline-flex h-10 items-center rounded-2xl border border-border bg-white px-4 text-sm">
              ویرایش
            </span>
          </Link>
        ) : null
      }
    >
      {isLoading ? (
        <Skeleton className="h-80 w-full rounded-2xl" />
      ) : isError || !data ? (
        <p className="text-rose-600">محصول یافت نشد.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-border bg-white p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold">{data.title}</h2>
            <p className="mt-1 font-mono text-xs text-stone-500">{data.sku}</p>
            <p className="mt-4 text-sm leading-relaxed text-stone-700">{data.description}</p>
            <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-stone-500">دسته</dt>
                <dd>{PRODUCT_CATEGORY_FA[data.category] ?? data.category}</dd>
              </div>
              <div>
                <dt className="text-stone-500">عیار</dt>
                <dd>{data.karat}</dd>
              </div>
              <div>
                <dt className="text-stone-500">وزن</dt>
                <dd>{data.weightGram} گرم</dd>
              </div>
              <div>
                <dt className="text-stone-500">اجرت</dt>
                <dd>{data.makingFeePercent}%</dd>
              </div>
              <div>
                <dt className="text-stone-500">قیمت پایه</dt>
                <dd>{formatToman(data.priceToman)} تومان</dd>
              </div>
              {data.finalPriceToman ? (
                <div>
                  <dt className="text-stone-500">قیمت لحظه‌ای</dt>
                  <dd className="font-semibold text-gold-dark">
                    {formatToman(data.finalPriceToman)} تومان
                  </dd>
                </div>
              ) : null}
            </dl>
          </Card>
          <Card className="border-border bg-white p-6">
            {data.imageUrl ? (
              <img
                src={data.imageUrl}
                alt={data.title}
                className="aspect-square w-full rounded-xl object-cover"
              />
            ) : null}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">موجودی</span>
                <Badge>{data.inventory?.available ?? 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">رزرو</span>
                <span>{data.inventory?.reserved ?? 0}</span>
              </div>
              {data.featured ? <Badge className="bg-gold-50 text-gold-dark">ویژه</Badge> : null}
            </div>
          </Card>
        </div>
      )}
    </CatalogPageShell>
  );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Card, Input, Label, Skeleton } from '@sadafgold/ui';
import {
  createAdminProduct,
  fetchAdminProductBySlug,
  updateAdminProduct,
} from '../api/commerce-api';
import { CatalogPageShell } from './catalog-page-shell';
import { PRODUCT_CATEGORY_FA, selectFieldClass } from '../lib/labels';

interface ProductFormPanelProps {
  mode: 'create' | 'edit';
  slug?: string;
}

const emptyForm = {
  sku: '',
  slug: '',
  title: '',
  description: '',
  seoDescription: '',
  category: 'RING',
  karat: '18',
  weightGram: '1',
  makingFeePercent: '10',
  priceToman: '0',
  imageUrl: '',
  featured: false,
  initialQuantity: '0',
};

export function ProductFormPanel({ mode, slug }: ProductFormPanelProps) {
  const router = useRouter();
  const routeId = mode === 'create' ? 'products.new' : 'products.edit';
  const [form, setForm] = useState(emptyForm);

  const detailQuery = useQuery({
    queryKey: ['admin', 'commerce', 'product-slug', slug],
    queryFn: () => fetchAdminProductBySlug(slug!),
    enabled: mode === 'edit' && Boolean(slug),
  });

  useEffect(() => {
    if (detailQuery.data) {
      const p = detailQuery.data;
      setForm({
        sku: p.sku,
        slug: p.slug,
        title: p.title,
        description: p.description,
        seoDescription: p.seoDescription,
        category: p.category,
        karat: String(p.karat),
        weightGram: p.weightGram,
        makingFeePercent: String(p.makingFeePercent),
        priceToman: String(p.priceToman),
        imageUrl: p.imageUrl,
        featured: p.featured,
        initialQuantity: '0',
      });
    }
  }, [detailQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = {
        sku: form.sku,
        slug: form.slug || undefined,
        title: form.title,
        description: form.description,
        seoDescription: form.seoDescription || undefined,
        category: form.category,
        karat: Number(form.karat),
        weightGram: Number(form.weightGram),
        makingFeePercent: Number(form.makingFeePercent),
        priceToman: Number(form.priceToman),
        imageUrl: form.imageUrl,
        featured: form.featured,
        initialQuantity: mode === 'create' ? Number(form.initialQuantity) : undefined,
      };
      if (mode === 'create') {
        return createAdminProduct(body);
      }
      return updateAdminProduct(detailQuery.data!.id, body);
    },
    onSuccess: (product) => {
      router.push(`/products/${product.slug}`);
    },
  });

  if (mode === 'edit' && detailQuery.isLoading) {
    return (
      <CatalogPageShell routeId={routeId}>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </CatalogPageShell>
    );
  }

  return (
    <CatalogPageShell routeId={routeId}>
      <Card className="border-border bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>SKU *</Label>
            <Input
              className="mt-1"
              value={form.sku}
              disabled={mode === 'edit'}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
          </div>
          <div>
            <Label>اسلاگ</Label>
            <Input
              className="mt-1"
              value={form.slug}
              disabled={mode === 'edit'}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="خودکار از عنوان"
            />
          </div>
          <div className="md:col-span-2">
            <Label>عنوان *</Label>
            <Input
              className="mt-1"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Label>توضیحات *</Label>
            <textarea
              className="mt-1 min-h-[100px] w-full rounded-2xl border border-border px-3 py-2 text-sm"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <Label>دسته</Label>
            <select
              className={selectFieldClass}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {Object.entries(PRODUCT_CATEGORY_FA).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>عیار</Label>
            <Input
              className="mt-1"
              type="number"
              value={form.karat}
              onChange={(e) => setForm({ ...form, karat: e.target.value })}
            />
          </div>
          <div>
            <Label>وزن (گرم)</Label>
            <Input
              className="mt-1"
              value={form.weightGram}
              onChange={(e) => setForm({ ...form, weightGram: e.target.value })}
            />
          </div>
          <div>
            <Label>اجرت (%)</Label>
            <Input
              className="mt-1"
              value={form.makingFeePercent}
              onChange={(e) => setForm({ ...form, makingFeePercent: e.target.value })}
            />
          </div>
          <div>
            <Label>قیمت پایه (تومان)</Label>
            <Input
              className="mt-1"
              value={form.priceToman}
              onChange={(e) => setForm({ ...form, priceToman: e.target.value })}
            />
          </div>
          {mode === 'create' ? (
            <div>
              <Label>موجودی اولیه</Label>
              <Input
                className="mt-1"
                type="number"
                value={form.initialQuantity}
                onChange={(e) => setForm({ ...form, initialQuantity: e.target.value })}
              />
            </div>
          ) : null}
          <div className="md:col-span-2">
            <Label>URL تصویر *</Label>
            <Input
              className="mt-1"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            محصول ویژه
          </label>
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            className="h-10 px-4"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            {mode === 'create' ? 'ایجاد محصول' : 'ذخیره تغییرات'}
          </Button>
          <Link href="/products">
            <Button variant="outline" className="h-10 px-4">
              انصراف
            </Button>
          </Link>
        </div>
        {saveMutation.isError ? (
          <p className="mt-3 text-sm text-rose-600">ذخیره ناموفق بود. فیلدها را بررسی کنید.</p>
        ) : null}
      </Card>
    </CatalogPageShell>
  );
}

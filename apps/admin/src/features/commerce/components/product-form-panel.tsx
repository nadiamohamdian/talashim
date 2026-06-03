'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Card, Input, Label, Skeleton } from '@talashim/ui';
import {
  createAdminProduct,
  fetchAdminProductBySlug,
  updateAdminProduct,
} from '../api/commerce-api';
import { CatalogPageShell } from './catalog-page-shell';
import { ProductMediaFields } from './product-media-fields';
import { ProductVariantFields } from './product-variant-fields';
import { PRODUCT_CATEGORY_FA, selectFieldClass } from '../lib/labels';
import {
  buildProductCreateBody,
  toDatetimeLocalInput,
  validateProductForm,
  type ProductFormValues,
} from '../lib/product-form-validation';
import type { GalleryImageField, ProductVideoField } from './product-media-fields';
import type { ProductVariantField } from './product-variant-fields';

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
  discountPercent: '',
  discountStartsAt: '',
  discountEndsAt: '',
};

export function ProductFormPanel({ mode, slug }: ProductFormPanelProps) {
  const router = useRouter();
  const routeId = mode === 'create' ? 'products.new' : 'products.edit';
  const [form, setForm] = useState(emptyForm);
  const [galleryImages, setGalleryImages] = useState<GalleryImageField[]>([]);
  const [videos, setVideos] = useState<ProductVideoField[]>([]);
  const [variants, setVariants] = useState<ProductVariantField[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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
        discountPercent: p.discountPercent ? String(p.discountPercent) : '',
        discountStartsAt: toDatetimeLocalInput(p.discountStartsAt),
        discountEndsAt: toDatetimeLocalInput(p.discountEndsAt),
      });
      setGalleryImages(
        p.galleryImages.map((image) => ({ url: image.url, alt: image.alt })),
      );
      setVideos(
        p.videos.map((video) => ({
          title: video.title,
          videoUrl: video.videoUrl,
          thumbnailUrl: video.thumbnailUrl ?? '',
          sortOrder: video.sortOrder,
        })),
      );
      setVariants(
        p.variants.length > 0
          ? p.variants.map((variant) => ({
              sku: variant.sku,
              color: variant.color ?? '',
              size: variant.size ?? '',
              priceToman: String(variant.priceToman),
              weightGram: variant.weightGram ?? '',
              makingFeePercent: variant.makingFeePercent
                ? String(variant.makingFeePercent)
                : '',
              imageUrl: variant.imageUrl ?? '',
              quantity: String(variant.quantity),
              isDefault: variant.isDefault,
            }))
          : [],
      );
    }
  }, [detailQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const formValues: ProductFormValues = {
        sku: form.sku,
        title: form.title,
        description: form.description,
        imageUrl: form.imageUrl,
        weightGram: form.weightGram,
        karat: form.karat,
        priceToman: form.priceToman,
        discountPercent: form.discountPercent,
        discountStartsAt: form.discountStartsAt,
        discountEndsAt: form.discountEndsAt,
      };

      const errors = validateProductForm(formValues, variants);
      if (errors.length > 0) {
        setValidationErrors(errors);
        throw new Error(errors[0]);
      }
      setValidationErrors([]);

      const body = buildProductCreateBody(
        {
          ...form,
          slug: form.slug,
          seoDescription: form.seoDescription,
          category: form.category,
          makingFeePercent: form.makingFeePercent,
          priceToman: form.priceToman,
          featured: form.featured,
          initialQuantity: form.initialQuantity,
          discountPercent: form.discountPercent,
          discountStartsAt: form.discountStartsAt,
          discountEndsAt: form.discountEndsAt,
        },
        galleryImages,
        videos,
        variants,
        mode,
      );

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
          <div className="md:col-span-2">
            <Label>توضیح سئو</Label>
            <Input
              className="mt-1"
              value={form.seoDescription}
              onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
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
          <div>
            <Label>تخفیف (%)</Label>
            <Input
              className="mt-1"
              type="number"
              min={0}
              max={100}
              value={form.discountPercent}
              onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
              placeholder="۰ = بدون تخفیف"
            />
          </div>
          <div>
            <Label>شروع تخفیف</Label>
            <Input
              className="mt-1"
              type="datetime-local"
              value={form.discountStartsAt}
              onChange={(e) => setForm({ ...form, discountStartsAt: e.target.value })}
            />
          </div>
          <div>
            <Label>پایان تخفیف</Label>
            <Input
              className="mt-1"
              type="datetime-local"
              value={form.discountEndsAt}
              onChange={(e) => setForm({ ...form, discountEndsAt: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            محصول ویژه
          </label>

          <ProductMediaFields
            imageUrl={form.imageUrl}
            onImageUrlChange={(value) => setForm({ ...form, imageUrl: value })}
            galleryImages={galleryImages}
            onGalleryChange={setGalleryImages}
            videos={videos}
            onVideosChange={setVideos}
          />

          <ProductVariantFields
            baseSku={form.sku}
            variants={variants}
            onChange={setVariants}
          />
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
        {validationErrors.length > 0 ? (
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-rose-600">
            {validationErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        ) : null}
        {saveMutation.isError && validationErrors.length === 0 ? (
          <p className="mt-3 text-sm text-rose-600">ذخیره ناموفق بود. فیلدها را بررسی کنید.</p>
        ) : null}
      </Card>
    </CatalogPageShell>
  );
}

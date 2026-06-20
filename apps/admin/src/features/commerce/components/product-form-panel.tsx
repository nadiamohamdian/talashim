'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Input, Label, Skeleton } from '@talashim/ui';
import {
  createAdminProduct,
  fetchAdminProductBySlug,
  updateAdminProduct,
} from '../api/commerce-api';
import { getApiErrorMessage } from '@/shared/api/axios-client';
import { CatalogPageShell } from './catalog-page-shell';
import { ProductMediaFields } from './product-media-fields';
import { ProductVariantFields } from './product-variant-fields';
import { PRODUCT_CATEGORY_FA, STANDARD_PRODUCT_KARATS, selectFieldClass } from '../lib/labels';
import {
  buildProductCreateBody,
  ProductFormValidationError,
  validateProductForm,
  type ProductFormValues,
} from '../lib/product-form-validation';
import { PersianDateTimePicker } from '@/shared/ui/persian-datetime-picker';
import { RichTextEditor } from '@/shared/ui/rich-text-editor';
import { FormattedNumberInput } from '@/shared/ui/formatted-number-input';
import {
  ProductSeoFields,
  hasProductSeoContent,
  type ProductSeoFormValues,
} from './product-seo-fields';
import type { GalleryImageField, ProductVideoField } from './product-media-fields';
import type { ProductVariantField } from './product-variant-fields';
import {
  pdpConfigToForm,
  ProductPdpOptionsFields,
  type ProductPdpOptionsForm,
  emptyPdpOptionsForm,
} from './product-pdp-options-fields';
import { AdminFormSection } from '@/shared/ui/admin-form-section';

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
  seoTitle: '',
  seoKeywords: '',
  ogImageUrl: '',
  seoCanonicalPath: '',
  seoNoIndex: false,
  category: 'RING',
  karat: '18',
  weightGram: '1',
  makingFeePercent: '10',
  priceToman: '0',
  imageUrl: '',
  hoverImageUrl: '',
  featured: false,
  initialQuantity: '0',
  discountPercent: '',
  discountStartsAt: '',
  discountEndsAt: '',
};

export function ProductFormPanel({ mode, slug }: ProductFormPanelProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const routeId = mode === 'create' ? 'products.new' : 'products.edit';
  const [form, setForm] = useState(emptyForm);
  const [galleryImages, setGalleryImages] = useState<GalleryImageField[]>([]);
  const [videos, setVideos] = useState<ProductVideoField[]>([]);
  const [variants, setVariants] = useState<ProductVariantField[]>([]);
  const [pdpOptions, setPdpOptions] = useState<ProductPdpOptionsForm>(emptyPdpOptionsForm);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const hydratedSlugRef = useRef<string | null>(null);
  const originalImageUrlRef = useRef('');
  const originalHoverImageUrlRef = useRef('');

  const detailQuery = useQuery({
    queryKey: ['admin', 'commerce', 'product-slug', slug],
    queryFn: () => fetchAdminProductBySlug(slug!),
    enabled: mode === 'edit' && Boolean(slug),
  });

  useEffect(() => {
    if (mode !== 'edit' || !slug) {
      hydratedSlugRef.current = null;
      originalImageUrlRef.current = '';
      originalHoverImageUrlRef.current = '';
      return;
    }
    if (hydratedSlugRef.current !== slug) {
      hydratedSlugRef.current = null;
      originalImageUrlRef.current = '';
      originalHoverImageUrlRef.current = '';
    }
  }, [mode, slug]);

  useEffect(() => {
    if (mode !== 'edit' || !detailQuery.data || hydratedSlugRef.current === slug) {
      return;
    }

    const p = detailQuery.data;
    originalImageUrlRef.current = p.imageUrl;
    originalHoverImageUrlRef.current = p.hoverImageUrl;
    hydratedSlugRef.current = slug ?? null;
    setForm({
        sku: p.sku,
        slug: p.slug,
        title: p.title,
        description: p.description,
        seoDescription: p.seoDescription,
        seoTitle: p.seoTitle ?? '',
        seoKeywords: p.seoKeywords ?? '',
        ogImageUrl: p.ogImageUrl ?? '',
        seoCanonicalPath: p.seoCanonicalPath ?? '',
        seoNoIndex: p.seoNoIndex ?? false,
        category: p.category,
        karat: STANDARD_PRODUCT_KARATS.some((k) => k.value === String(p.karat))
          ? String(p.karat)
          : '18',
        weightGram: p.weightGram,
        makingFeePercent: String(p.makingFeePercent),
        priceToman: String(p.priceToman),
        imageUrl: p.imageUrl,
        hoverImageUrl: p.hoverImageUrl,
        featured: p.featured,
        initialQuantity: '0',
        discountPercent: p.discountPercent ? String(p.discountPercent) : '',
        discountStartsAt: p.discountStartsAt ?? '',
        discountEndsAt: p.discountEndsAt ?? '',
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
      setPdpOptions(pdpConfigToForm(p.pdpConfig));
  }, [detailQuery.data, mode, slug]);

  useEffect(() => {
    const raw = form.discountPercent.trim();
    const percent = raw ? Number(raw) : 0;
    if (percent <= 0 || percent > 100) {
      return;
    }
    if (form.discountStartsAt && form.discountEndsAt) {
      return;
    }

    const start = form.discountStartsAt || new Date().toISOString();
    const end =
      form.discountEndsAt ||
      (() => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date.toISOString();
      })();

    setForm((current) => {
      if (current.discountStartsAt && current.discountEndsAt) {
        return current;
      }
      return {
        ...current,
        discountStartsAt: current.discountStartsAt || start,
        discountEndsAt: current.discountEndsAt || end,
      };
    });
  }, [form.discountPercent, form.discountStartsAt, form.discountEndsAt]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const formValues: ProductFormValues = {
        sku: form.sku,
        title: form.title,
        description: form.description,
        imageUrl: form.imageUrl,
        hoverImageUrl: form.hoverImageUrl,
        weightGram: form.weightGram,
        karat: form.karat,
        priceToman: form.priceToman,
        discountPercent: form.discountPercent,
        discountStartsAt: form.discountStartsAt,
        discountEndsAt: form.discountEndsAt,
      };

      const seoValues: ProductSeoFormValues = {
        seoTitle: form.seoTitle,
        seoDescription: form.seoDescription,
        seoKeywords: form.seoKeywords,
        ogImageUrl: form.ogImageUrl,
        seoCanonicalPath: form.seoCanonicalPath,
        seoNoIndex: form.seoNoIndex,
      };

      const errors = validateProductForm(formValues, variants, seoValues, {
        mode,
        originalImageUrl: originalImageUrlRef.current,
        originalHoverImageUrl: originalHoverImageUrlRef.current,
      });
      if (errors.length > 0) {
        setValidationErrors(errors);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        throw new ProductFormValidationError(errors[0] ?? 'Validation failed');
      }
      setValidationErrors([]);
      setSubmitError(null);

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
        pdpOptions,
      );

      if (mode === 'create') {
        return createAdminProduct(body);
      }

      const productId = detailQuery.data?.id;
      if (!productId) {
        throw new Error('Product data is not available');
      }

      return updateAdminProduct(productId, body);
    },
    onSuccess: (product) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'commerce', 'products'] });
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'commerce', 'product-slug', product.slug],
      });
      router.push(`/products/${product.slug}`);
    },
    onError: (error) => {
      if (error instanceof ProductFormValidationError) {
        setSubmitError('ذخیره انجام نشد. موارد مشخص‌شده در بالای فرم را بررسی کنید.');
        return;
      }
      setSubmitError(getApiErrorMessage(error, 'ذخیره محصول ناموفق بود.'));
    },
  });

  if (mode === 'edit' && detailQuery.isLoading) {
    return (
      <CatalogPageShell routeId={routeId}>
        <Skeleton className="h-96 w-full rounded-xl" />
      </CatalogPageShell>
    );
  }

  if (mode === 'edit' && (detailQuery.isError || !detailQuery.data)) {
    return (
      <CatalogPageShell routeId={routeId}>
        <div className="rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-6">
          <p className="text-sm font-semibold text-[var(--error)]">بارگذاری محصول ناموفق بود.</p>
          <Link
            href="/products"
            className="mt-4 inline-block text-sm font-medium text-[var(--primary)] hover:underline"
          >
            بازگشت به فهرست محصولات
          </Link>
        </div>
      </CatalogPageShell>
    );
  }

  const seoValues: ProductSeoFormValues = {
    seoTitle: form.seoTitle,
    seoDescription: form.seoDescription,
    seoKeywords: form.seoKeywords,
    ogImageUrl: form.ogImageUrl,
    seoCanonicalPath: form.seoCanonicalPath,
    seoNoIndex: form.seoNoIndex,
  };
  const seoConfigured = hasProductSeoContent(seoValues);

  return (
    <CatalogPageShell routeId={routeId}>
      <div className="product-form-shell">
        {validationErrors.length > 0 ? (
          <div className="rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3">
            <p className="text-sm font-semibold text-[var(--error)]">لطفاً موارد زیر را تکمیل کنید:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[var(--error)]">
              {validationErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {submitError ? (
          <div className="rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)]">
            {submitError}
          </div>
        ) : null}

        <AdminFormSection
          title="اطلاعات اصلی"
          description="شناسه، عنوان و توضیحات محصول"
        >
          <div>
            <Label className="admin-field-label">SKU *</Label>
            <Input
              className="mt-1.5"
              value={form.sku}
              disabled={mode === 'edit'}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
          </div>
          <div>
            <Label className="admin-field-label">اسلاگ</Label>
            <Input
              className="mt-1.5"
              value={form.slug}
              disabled={mode === 'edit'}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="خودکار از عنوان"
            />
          </div>
          <div className="md:col-span-2" data-span="full">
            <Label className="admin-field-label">عنوان *</Label>
            <Input
              className="mt-1.5"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="md:col-span-2" data-span="full">
            <RichTextEditor
              mediaFolder="products"
              label="توضیحات"
              required
              hint="متن کامل محصول — تصاویر را با دکمه «تصویر» از کتابخانه درج کنید."
              value={form.description}
              onChange={(description) => setForm({ ...form, description })}
              minHeight={220}
            />
          </div>
        </AdminFormSection>

        <AdminFormSection
          title="قیمت‌گذاری و دسته‌بندی"
          description="عیار، وزن، اجرت، قیمت پایه و تخفیف"
        >
          <div>
            <Label className="admin-field-label">دسته</Label>
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
            <Label className="admin-field-label">عیار</Label>
            <select
              className={selectFieldClass}
              value={form.karat}
              onChange={(e) => setForm({ ...form, karat: e.target.value })}
            >
              {STANDARD_PRODUCT_KARATS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="admin-field-label">وزن (گرم)</Label>
            <Input
              className="mt-1.5"
              value={form.weightGram}
              onChange={(e) => setForm({ ...form, weightGram: e.target.value })}
            />
          </div>
          <div>
            <Label className="admin-field-label">اجرت (%)</Label>
            <Input
              className="mt-1.5"
              value={form.makingFeePercent}
              onChange={(e) => setForm({ ...form, makingFeePercent: e.target.value })}
            />
          </div>
          <FormattedNumberInput
            label="قیمت پایه (تومان)"
            value={form.priceToman}
            onChange={(priceToman) => setForm({ ...form, priceToman })}
            hint="هر سه رقم با جداکننده فارسی نمایش داده می‌شود."
          />
          {mode === 'create' ? (
            <div>
              <Label className="admin-field-label">موجودی اولیه</Label>
              <Input
                className="mt-1.5"
                type="number"
                value={form.initialQuantity}
                onChange={(e) => setForm({ ...form, initialQuantity: e.target.value })}
              />
            </div>
          ) : null}
          <div>
            <Label className="admin-field-label">تخفیف (%)</Label>
            <Input
              className="mt-1.5"
              type="number"
              min={0}
              max={100}
              value={form.discountPercent}
              onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
              placeholder="۰ = بدون تخفیف"
            />
          </div>
          <PersianDateTimePicker
            label="شروع تخفیف"
            value={form.discountStartsAt}
            onChange={(discountStartsAt) => setForm({ ...form, discountStartsAt })}
          />
          <PersianDateTimePicker
            label="پایان تخفیف"
            value={form.discountEndsAt}
            onChange={(discountEndsAt) => setForm({ ...form, discountEndsAt })}
          />
          <label className="admin-checkbox-row md:col-span-2" data-span="full">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            <span>محصول ویژه — نمایش در بخش‌های ویژه فروشگاه</span>
          </label>
        </AdminFormSection>

        <AdminFormSection
          title="تصاویر و ویدیو"
          description="تصویر شاخص، هاور، گالری و ویدیوهای معرفی"
        >
          <ProductMediaFields
            imageUrl={form.imageUrl}
            onImageUrlChange={(value) => setForm({ ...form, imageUrl: value })}
            hoverImageUrl={form.hoverImageUrl}
            onHoverImageUrlChange={(value) => setForm({ ...form, hoverImageUrl: value })}
            galleryImages={galleryImages}
            onGalleryChange={setGalleryImages}
            videos={videos}
            onVideosChange={setVideos}
          />
        </AdminFormSection>

        <AdminFormSection
          title="گزینه‌های صفحه محصول"
          description="مشخصات جدول، رنگ طلا، رنگ سنگ و خط‌کش سایز"
          badge={pdpOptions.enableGoldColors || pdpOptions.enableStoneColors || pdpOptions.enableSizeRuler ? 'فعال' : undefined}
        >
          <ProductPdpOptionsFields
            baseSku={form.sku}
            basePriceToman={form.priceToman}
            options={pdpOptions}
            onChange={setPdpOptions}
            onGenerateVariants={setVariants}
          />
        </AdminFormSection>

        <AdminFormSection
          title="واریانت‌ها"
          description="قیمت، وزن و موجودی برای هر ترکیب رنگ و سایز"
          badge={variants.length > 0 ? `${variants.length} واریانت` : undefined}
        >
          <ProductVariantFields
            baseSku={form.sku}
            variants={variants}
            onChange={setVariants}
          />
        </AdminFormSection>

        <AdminFormSection
          title="سئو و متادیتا"
          description="عنوان متا، توضیحات، کلمات کلیدی و Open Graph"
          collapsible
          defaultOpen={seoConfigured}
          badge={seoConfigured ? 'تنظیم شده' : 'اختیاری'}
        >
          <ProductSeoFields
            value={seoValues}
            onChange={(seo) =>
              setForm({
                ...form,
                seoTitle: seo.seoTitle,
                seoDescription: seo.seoDescription,
                seoKeywords: seo.seoKeywords,
                ogImageUrl: seo.ogImageUrl,
                seoCanonicalPath: seo.seoCanonicalPath,
                seoNoIndex: seo.seoNoIndex,
              })
            }
            productTitle={form.title}
            productSlug={form.slug}
          />
        </AdminFormSection>

        <div className="product-form-actions">
          <Button
            className="btn-luxury h-11 px-5"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            {mode === 'create' ? 'ایجاد محصول' : 'ذخیره تغییرات'}
          </Button>
          <Link href="/products">
            <Button variant="outline" className="h-11 px-5">
              انصراف
            </Button>
          </Link>
        </div>
      </div>
    </CatalogPageShell>
  );
}

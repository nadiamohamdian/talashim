'use client';

import { Input, Label } from '@talashim/ui';
import { ImageUrlField } from '@/features/cms/components/image-url-field';

export interface ProductSeoFormValues {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImageUrl: string;
  seoCanonicalPath: string;
  seoNoIndex: boolean;
}

export const emptyProductSeo = (): ProductSeoFormValues => ({
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  ogImageUrl: '',
  seoCanonicalPath: '',
  seoNoIndex: false,
});

interface ProductSeoFieldsProps {
  value: ProductSeoFormValues;
  onChange: (value: ProductSeoFormValues) => void;
  productTitle: string;
  productSlug: string;
}

function CharCounter({ current, max, min }: { current: number; max: number; min?: number }) {
  const ok = current >= (min ?? 0) && current <= max;
  return (
    <span className={`text-[11px] ${ok ? 'text-muted' : 'text-[var(--warning)]'}`}>
      {current.toLocaleString('fa-IR')} / {max.toLocaleString('fa-IR')}
    </span>
  );
}

export function ProductSeoFields({
  value,
  onChange,
  productTitle,
  productSlug,
}: ProductSeoFieldsProps) {
  const patch = (partial: Partial<ProductSeoFormValues>) => onChange({ ...value, ...partial });

  const previewTitle = value.seoTitle.trim() || productTitle.trim() || 'عنوان محصول';
  const previewDescription =
    value.seoDescription.trim() || 'توضیح متا برای موتورهای جستجو در اینجا نمایش داده می‌شود.';

  return (
    <>
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4 md:col-span-2" data-span="full">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          پیش‌نمایش گوگل
        </p>
        <p className="mt-2 truncate text-base text-[#1a4f9c]">{previewTitle} | طلاشیم</p>
        <p className="truncate font-mono text-xs text-[var(--success)]" dir="ltr">
          talashim.ir/products/{productSlug || 'slug'}
        </p>
        <p className="mt-1 line-clamp-2 text-xs leading-6 text-[var(--muted-foreground)]">
          {previewDescription}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <Label className="admin-field-label mb-0">عنوان سئو (Title)</Label>
          <CharCounter current={value.seoTitle.length} max={60} />
        </div>
        <Input
          className="mt-1.5"
          value={value.seoTitle}
          placeholder={productTitle || 'خالی = عنوان محصول'}
          onChange={(e) => patch({ seoTitle: e.target.value.slice(0, 60) })}
        />
        <p className="admin-field-hint">حداکثر ۶۰ کاراکتر — در تب مرورگر نمایش داده می‌شود.</p>
      </div>

      <div className="md:col-span-2" data-span="full">
        <div className="flex items-center justify-between gap-2">
          <Label className="admin-field-label mb-0">توضیح متا (Meta Description)</Label>
          <CharCounter current={value.seoDescription.length} max={160} min={50} />
        </div>
        <textarea
          className="mt-1.5 min-h-[6.5rem] w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] p-3.5 text-[0.9375rem] leading-7 text-[var(--foreground)] shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] focus:border-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary-muted)]"
          value={value.seoDescription}
          maxLength={160}
          placeholder="خلاصه جذاب ۵۰–۱۶۰ کاراکتری برای نتایج جستجو"
          onChange={(e) => patch({ seoDescription: e.target.value.slice(0, 160) })}
        />
      </div>

      <div className="md:col-span-2" data-span="full">
        <Label className="admin-field-label">کلمات کلیدی</Label>
        <Input
          className="mt-1.5"
          value={value.seoKeywords}
          placeholder="طلای ۱۸ عیار، انگشتر طلا، خرید آنلاین — با ویرگول جدا کنید"
          onChange={(e) => patch({ seoKeywords: e.target.value })}
        />
        <p className="admin-field-hint">
          حداکثر ۱۰ کلمه — هر کلمه ۲ تا ۴۰ کاراکتر. مثال: طلای زنانه، گردنبند طلا
        </p>
      </div>

      <div className="md:col-span-2" data-span="full">
        <ImageUrlField
          label="تصویر Open Graph (og:image)"
          hint="در اشتراک‌گذاری شبکه‌های اجتماعی — از کتابخانه رسانه انتخاب کنید. خالی = تصویر شاخص محصول."
          value={value.ogImageUrl}
          onChange={(ogImageUrl) => patch({ ogImageUrl })}
          folder="products"
        />
      </div>

      <div className="md:col-span-2" data-span="full">
        <Label className="admin-field-label">مسیر Canonical (اختیاری)</Label>
        <Input
          className="mt-1.5 font-mono text-sm"
          dir="ltr"
          value={value.seoCanonicalPath}
          placeholder={`/products/${productSlug || 'slug'}`}
          onChange={(e) => patch({ seoCanonicalPath: e.target.value })}
        />
      </div>

      <label className="admin-checkbox-row md:col-span-2" data-span="full">
        <input
          type="checkbox"
          checked={value.seoNoIndex}
          onChange={(e) => patch({ seoNoIndex: e.target.checked })}
        />
        <span>عدم ایندکس (noindex) — صفحه در گوگل نمایش داده نشود</span>
      </label>
    </>
  );
}

export function parseSeoKeywords(raw: string): string[] {
  return raw
    .split(/[,،]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 10);
}

export function validateProductSeo(seo: ProductSeoFormValues): string[] {
  const errors: string[] = [];
  if (seo.seoTitle.length > 60) {
    errors.push('عنوان سئو حداکثر ۶۰ کاراکتر باشد.');
  }
  const descLen = seo.seoDescription.trim().length;
  if (descLen > 0 && descLen < 50) {
    errors.push('توضیح متا باید حداقل ۵۰ کاراکتر باشد (یا خالی بماند).');
  }
  if (descLen > 160) {
    errors.push('توضیح متا حداکثر ۱۶۰ کاراکتر باشد.');
  }
  const keywords = parseSeoKeywords(seo.seoKeywords);
  for (const keyword of keywords) {
    if (keyword.length < 2 || keyword.length > 40) {
      errors.push('هر کلمه کلیدی باید بین ۲ تا ۴۰ کاراکتر باشد.');
      break;
    }
  }
  if (keywords.length > 10) {
    errors.push('حداکثر ۱۰ کلمه کلیدی مجاز است.');
  }
  return errors;
}

export function hasProductSeoContent(value: ProductSeoFormValues): boolean {
  return Boolean(
    value.seoTitle.trim() ||
      value.seoDescription.trim() ||
      value.seoKeywords.trim() ||
      value.ogImageUrl.trim() ||
      value.seoCanonicalPath.trim() ||
      value.seoNoIndex,
  );
}

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
    <span className={`text-[11px] ${ok ? 'text-stone-500' : 'text-amber-700'}`}>
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
    <div className="md:col-span-2 space-y-4 rounded-2xl border border-border bg-nude-50/40 p-5">
      <div>
        <h3 className="text-sm font-bold text-stone-900">سئو و متادیتا</h3>
        <p className="mt-1 text-xs leading-6 text-stone-500">
          عنوان متا، توضیحات، کلمات کلیدی و تصویر Open Graph — مطابق استانداردهای Google.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-white p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">
          پیش‌نمایش گوگل
        </p>
        <p className="mt-2 truncate text-base text-blue-700">{previewTitle} | طلاشیم</p>
        <p className="truncate font-mono text-xs text-emerald-700" dir="ltr">
          talashim.ir/products/{productSlug || 'slug'}
        </p>
        <p className="mt-1 line-clamp-2 text-xs leading-6 text-stone-600">{previewDescription}</p>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <Label>عنوان سئو (Title)</Label>
          <CharCounter current={value.seoTitle.length} max={60} />
        </div>
        <Input
          className="mt-1"
          value={value.seoTitle}
          placeholder={productTitle || 'خالی = عنوان محصول'}
          onChange={(e) => patch({ seoTitle: e.target.value.slice(0, 60) })}
        />
        <p className="mt-1 text-[11px] text-stone-500">حداکثر ۶۰ کاراکتر — در تب مرورگر نمایش داده می‌شود.</p>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <Label>توضیح متا (Meta Description)</Label>
          <CharCounter current={value.seoDescription.length} max={160} min={50} />
        </div>
        <textarea
          className="mt-1 min-h-[96px] w-full rounded-2xl border border-border bg-white p-3 text-sm leading-7"
          value={value.seoDescription}
          maxLength={160}
          placeholder="خلاصه جذاب ۵۰–۱۶۰ کاراکتری برای نتایج جستجو"
          onChange={(e) => patch({ seoDescription: e.target.value.slice(0, 160) })}
        />
      </div>

      <div>
        <Label>کلمات کلیدی</Label>
        <Input
          className="mt-1"
          value={value.seoKeywords}
          placeholder="طلای ۱۸ عیار، انگشتر طلا، خرید آنلاین — با ویرگول جدا کنید"
          onChange={(e) => patch({ seoKeywords: e.target.value })}
        />
        <p className="mt-1 text-[11px] text-stone-500">
          حداکثر ۱۰ کلمه — هر کلمه ۲ تا ۴۰ کاراکتر. مثال: طلای زنانه، گردنبند طلا
        </p>
      </div>

      <ImageUrlField
        label="تصویر Open Graph (og:image)"
        hint="در اشتراک‌گذاری شبکه‌های اجتماعی — از کتابخانه رسانه انتخاب کنید. خالی = تصویر شاخص محصول."
        value={value.ogImageUrl}
        onChange={(ogImageUrl) => patch({ ogImageUrl })}
        folder="products"
        previewAlt="OG"
      />

      <div>
        <Label>مسیر Canonical (اختیاری)</Label>
        <Input
          className="mt-1 font-mono text-sm"
          dir="ltr"
          value={value.seoCanonicalPath}
          placeholder={`/products/${productSlug || 'slug'}`}
          onChange={(e) => patch({ seoCanonicalPath: e.target.value })}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={value.seoNoIndex}
          onChange={(e) => patch({ seoNoIndex: e.target.checked })}
        />
        <span>عدم ایندکس (noindex) — صفحه در گوگل نمایش داده نشود</span>
      </label>
    </div>
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

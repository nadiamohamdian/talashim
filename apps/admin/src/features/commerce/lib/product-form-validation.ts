import { validateLibraryImageUrl } from '@/features/cms/lib/validate-library-image';
import { stripHtml } from '@/shared/ui/rich-text-editor';
import { parseIntegerDigitsToNumber } from '@/shared/lib/format-input';
import { STANDARD_PRODUCT_KARAT_VALUES } from '../lib/labels';
import {
  parseSeoKeywords,
  validateProductSeo,
  type ProductSeoFormValues,
} from '../components/product-seo-fields';
import type { ProductVariantField } from '../components/product-variant-fields';
import type { GalleryImageField, ProductVideoField } from '../components/product-media-fields';

export class ProductFormValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProductFormValidationError';
  }
}

export type ProductFormValues = {
  sku: string;
  title: string;
  description: string;
  imageUrl: string;
  hoverImageUrl: string;
  weightGram: string;
  karat: string;
  priceToman: string;
  discountPercent?: string;
  discountStartsAt?: string;
  discountEndsAt?: string;
};

export function toDatetimeLocalInput(iso: string | null | undefined): string {
  if (!iso) {
    return '';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function normalizeDateTimeInput(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
  }
  return datetimeLocalToIso(trimmed);
}

export function datetimeLocalToIso(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return parsed.toISOString();
}

function isMeaningfulVariant(variant: ProductVariantField): boolean {
  return (
    variant.sku.trim().length > 0 ||
    variant.color.trim().length > 0 ||
    variant.size.trim().length > 0 ||
    variant.imageUrl.trim().length > 0 ||
    variant.weightGram.trim().length > 0 ||
    variant.makingFeePercent.trim().length > 0
  );
}

function filledVariants(variants: ProductVariantField[]): ProductVariantField[] {
  return variants.filter(isMeaningfulVariant);
}

export function normalizeMediaUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    return '';
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function resolveDiscountFields(form: {
  discountPercent?: string;
  discountStartsAt?: string;
  discountEndsAt?: string;
}) {
  const discountRaw = form.discountPercent?.trim() ?? '';
  const discountPercent = discountRaw ? Number(discountRaw) : 0;
  let discountStartsAt = normalizeDateTimeInput(form.discountStartsAt ?? '');
  let discountEndsAt = normalizeDateTimeInput(form.discountEndsAt ?? '');

  if (discountPercent > 0 && !discountEndsAt) {
    const end = new Date();
    end.setDate(end.getDate() + 30);
    discountEndsAt = end.toISOString();
  }

  if (discountPercent > 0 && !discountStartsAt) {
    discountStartsAt = new Date().toISOString();
  }

  return { discountPercent, discountStartsAt, discountEndsAt };
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

const MAX_PRICE_TOMAN = 9_999_999_999_999;

export function validateProductForm(
  form: ProductFormValues,
  variants: ProductVariantField[],
  seo?: ProductSeoFormValues,
  options?: {
    mode?: 'create' | 'edit';
    originalImageUrl?: string;
    originalHoverImageUrl?: string;
  },
): string[] {
  const errors: string[] = [];
  const mode = options?.mode ?? 'create';
  const originalImageUrl = options?.originalImageUrl?.trim() ?? '';
  const originalHoverImageUrl = options?.originalHoverImageUrl?.trim() ?? '';
  const coverImageChanged =
    mode === 'edit' && originalImageUrl.length > 0 && form.imageUrl.trim() === originalImageUrl;
  const hoverImageChanged =
    mode === 'edit' &&
    originalHoverImageUrl.length > 0 &&
    form.hoverImageUrl.trim() === originalHoverImageUrl;

  if (form.sku.trim().length < 2) {
    errors.push('SKU محصول را وارد کنید (حداقل ۲ کاراکتر).');
  }
  if (form.title.trim().length < 2) {
    errors.push('عنوان محصول را وارد کنید.');
  }
  if (stripHtml(form.description).length < 10) {
    errors.push('توضیحات باید حداقل ۱۰ کاراکتر باشد.');
  }

  if (!coverImageChanged) {
    const coverImageError = validateLibraryImageUrl(form.imageUrl, 'تصویر شاخص محصول');
    if (coverImageError) {
      errors.push(coverImageError);
    }
  }

  if (!hoverImageChanged) {
    const hoverImageError = validateLibraryImageUrl(form.hoverImageUrl, 'تصویر هاور محصول');
    if (hoverImageError) {
      errors.push(hoverImageError);
    }
  }

  const weight = Number(form.weightGram);
  if (!Number.isFinite(weight) || weight < 0.01) {
    errors.push('وزن محصول (گرم) باید بزرگ‌تر از صفر باشد.');
  }

  const karat = Number(form.karat);
  if (!STANDARD_PRODUCT_KARAT_VALUES.includes(String(karat))) {
    errors.push('عیار طلا باید یکی از مقادیر استاندارد (۱۸، ۲۱، ۲۲ یا ۲۴) باشد.');
  }

  const basePrice = parseIntegerDigitsToNumber(form.priceToman);
  if (!Number.isInteger(basePrice) || basePrice < 0 || basePrice > MAX_PRICE_TOMAN) {
    errors.push('قیمت پایه (تومان) نامعتبر است.');
  }

  if (seo) {
    errors.push(...validateProductSeo(seo));
  }

  const discountRaw = form.discountPercent?.trim() ?? '';
  if (discountRaw && Number(discountRaw) > 0) {
    const percent = Number(discountRaw);
    if (!Number.isInteger(percent) || percent < 1 || percent > 100) {
      errors.push('درصد تخفیف باید عدد صحیح بین ۱ تا ۱۰۰ باشد.');
    }
    const { discountEndsAt, discountStartsAt } = resolveDiscountFields(form);
    if (!discountEndsAt) {
      errors.push('تاریخ پایان تخفیف الزامی است.');
    } else if (discountStartsAt && new Date(discountEndsAt) <= new Date(discountStartsAt)) {
      errors.push('تاریخ پایان تخفیف باید بعد از شروع باشد.');
    }
  }

  const parentSku = form.sku.trim().toLowerCase();

  for (const [index, variant] of filledVariants(variants).entries()) {
    const sku = variant.sku.trim();
    if (sku.length < 2) {
      errors.push(`واریانت ${index + 1}: SKU واریانت را وارد کنید.`);
      continue;
    }
    const variantPrice = parseIntegerDigitsToNumber(variant.priceToman);
    if (!Number.isInteger(variantPrice) || variantPrice < 0 || variantPrice > MAX_PRICE_TOMAN) {
      errors.push(`واریانت ${index + 1}: قیمت (تومان) نامعتبر است.`);
    }
    if (sku.toLowerCase() === parentSku) {
      errors.push(`واریانت ${index + 1}: SKU واریانت نباید با SKU محصول یکسان باشد.`);
    }
    if (!variant.color.trim() && !variant.size.trim()) {
      errors.push(`واریانت ${index + 1}: رنگ یا سایز را مشخص کنید.`);
    }
    const variantWeight = variant.weightGram.trim();
    if (variantWeight) {
      const wg = Number(variantWeight);
      if (!Number.isFinite(wg) || wg < 0.01) {
        errors.push(`واریانت ${index + 1}: وزن باید بزرگ‌تر از صفر باشد یا خالی بماند.`);
      }
    }
    const variantImage = variant.imageUrl.trim();
    if (variantImage) {
      const variantImageError = validateLibraryImageUrl(
        variantImage,
        `تصویر واریانت ${index + 1}`,
      );
      if (variantImageError) {
        errors.push(variantImageError);
      }
    }
  }

  return errors;
}

export function buildProductCreateBody(
  form: ProductFormValues & {
    slug: string;
    seoDescription: string;
    seoTitle: string;
    seoKeywords: string;
    ogImageUrl: string;
    seoCanonicalPath: string;
    seoNoIndex: boolean;
    category: string;
    makingFeePercent: string;
    priceToman: string;
    featured: boolean;
    initialQuantity: string;
    discountPercent?: string;
    discountStartsAt?: string;
    discountEndsAt?: string;
  },
  galleryImages: GalleryImageField[],
  videos: ProductVideoField[],
  variants: ProductVariantField[],
  mode: 'create' | 'edit',
) {
  const { discountPercent, discountStartsAt, discountEndsAt } = resolveDiscountFields(form);

  const shared = {
    title: form.title.trim(),
    description: form.description.trim(),
    seoDescription: form.seoDescription.trim() || undefined,
    seoTitle: form.seoTitle.trim() || undefined,
    seoKeywords: parseSeoKeywords(form.seoKeywords).join(', ') || undefined,
    ogImageUrl: form.ogImageUrl.trim() ? normalizeMediaUrl(form.ogImageUrl) : undefined,
    seoCanonicalPath: form.seoCanonicalPath.trim() || undefined,
    seoNoIndex: form.seoNoIndex,
    category: form.category,
    karat: Number(form.karat),
    weightGram: Number(form.weightGram),
    makingFeePercent: Number(form.makingFeePercent),
    priceToman: parseIntegerDigitsToNumber(form.priceToman),
    imageUrl: normalizeMediaUrl(form.imageUrl),
    hoverImageUrl: normalizeMediaUrl(form.hoverImageUrl),
    featured: form.featured,
    discountPercent,
    discountStartsAt: discountPercent > 0 ? discountStartsAt : undefined,
    discountEndsAt: discountPercent > 0 ? discountEndsAt : undefined,
    galleryImages: galleryImages
      .filter((image) => image.url.trim().length > 0)
      .map((image, index) => ({
        url: normalizeMediaUrl(image.url),
        alt: image.alt.trim() || undefined,
        sortOrder: index,
      })),
    videos: videos
      .filter((video) => video.videoUrl.trim().length > 0)
      .map((video, index) => ({
        title: video.title.trim() || `ویدیو ${index + 1}`,
        videoUrl: normalizeMediaUrl(video.videoUrl),
        thumbnailUrl: video.thumbnailUrl.trim()
          ? normalizeMediaUrl(video.thumbnailUrl)
          : undefined,
        sortOrder: index,
      })),
    variants: filledVariants(variants)
      .filter((v) => v.sku.trim().length > 0)
      .map((variant, index) => {
        const weightRaw = variant.weightGram.trim();
        const weightGram = weightRaw ? Number(weightRaw) : undefined;
        const feeRaw = variant.makingFeePercent.trim();
        const imageRaw = variant.imageUrl.trim();

        return {
          sku: variant.sku.trim(),
          color: variant.color.trim() || undefined,
          size: variant.size.trim() || undefined,
          priceToman: parseIntegerDigitsToNumber(variant.priceToman),
          weightGram:
            weightGram !== undefined && Number.isFinite(weightGram) && weightGram >= 0.01
              ? weightGram
              : undefined,
          makingFeePercent: feeRaw ? Number(feeRaw) : undefined,
          imageUrl: imageRaw ? normalizeMediaUrl(imageRaw) : undefined,
          quantity: Number(variant.quantity) || 0,
          sortOrder: index,
          isDefault: variant.isDefault,
        };
      }),
  };

  if (mode === 'create') {
    return {
      ...shared,
      sku: form.sku.trim(),
      slug: form.slug.trim() || undefined,
      initialQuantity: Number(form.initialQuantity) || 0,
    };
  }

  return shared;
}

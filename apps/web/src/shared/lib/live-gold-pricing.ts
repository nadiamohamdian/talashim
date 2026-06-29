import {
  applyLivePricingToProduct,
  applyLivePricingToProducts,
  buildFallbackGoldTicker,
  calculateJewelryPricing,
  formatPricingBreakdown as sharedFormatPricingBreakdown,
  formatTomanAmountWithUnit,
  resolveStorefrontProductImageUrl,
} from '@sadafgold/shared';
import type { ProductDetails, ProductPricing, ProductSummary } from '@sadafgold/types';
import { isApiUnreachableError, serverFetch } from '@/lib/api/client';

export { sharedFormatPricingBreakdown as formatPricingBreakdown };

function normalizeProductImages<T extends Pick<ProductSummary, 'imageUrl' | 'hoverImageUrl' | 'category'>>(
  product: T,
): T {
  const imageUrl = resolveStorefrontProductImageUrl(product.imageUrl, product.category);
  const hoverImageUrl = product.hoverImageUrl
    ? resolveStorefrontProductImageUrl(product.hoverImageUrl, product.category)
    : product.hoverImageUrl;

  return {
    ...product,
    imageUrl,
    hoverImageUrl,
  };
}

function getDevFallbackGoldPricePerGram(karat = 18): number {
  const fallback = buildFallbackGoldTicker();
  const quote =
    fallback.items.find((item) => item.symbol === (karat >= 24 ? 'IR_GOLD_24K' : 'IR_GOLD_18K')) ??
    fallback.items[0];
  return quote?.price ?? 8_500_000;
}

export async function getLiveGoldPricePerGram(karat = 18): Promise<number> {
  try {
    const live = await serverFetch<{ pricePerGram: string }>(
      `/pricing/live?karat=${karat}&symbol=XAU-IRR`,
      { revalidate: 30, preserveConnectionError: true },
    );
    const price = Number(live.pricePerGram);
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error('Live gold price unavailable');
    }
    return price;
  } catch (error) {
    if (process.env.NODE_ENV === 'development' && isApiUnreachableError(error)) {
      return getDevFallbackGoldPricePerGram(karat);
    }
    throw error;
  }
}

async function resolveLivePricesByKarat(karats: number[]): Promise<Map<number, number>> {
  const unique = [...new Set(karats)];
  const entries = await Promise.all(
    unique.map(async (karat) => [karat, await getLiveGoldPricePerGram(karat)] as const),
  );
  return new Map(entries);
}

export function buildProductPricing(
  product: Pick<ProductSummary, 'weightGram' | 'karat' | 'makingFeePercent'>,
  livePricePerGramToman: number,
): ProductPricing {
  return calculateJewelryPricing({
    weightGram: product.weightGram,
    livePricePerGramToman,
    karat: product.karat,
    makingFeePercent: product.makingFeePercent,
  });
}

/** Prefer API pricing; recompute only when missing (SSR fallback). */
export async function withLivePricing<T extends ProductSummary>(product: T): Promise<T> {
  const normalized = normalizeProductImages(product);
  if (normalized.pricing?.pricedAt) {
    return normalized;
  }
  const livePrice = await getLiveGoldPricePerGram(normalized.karat);
  return applyLivePricingToProduct(normalized, livePrice);
}

export async function withLivePricingList(products: ProductSummary[]) {
  if (!products.length) {
    return [];
  }

  const normalizedProducts = products.map((product) => normalizeProductImages(product));
  const needsPricing = normalizedProducts.some((product) => !product.pricing?.pricedAt);
  if (!needsPricing) {
    return normalizedProducts;
  }

  const karats = normalizedProducts.map((product) => product.karat);
  const liveByKarat = await resolveLivePricesByKarat(karats);
  return applyLivePricingToProducts(normalizedProducts, liveByKarat);
}

export function buildSpecifications(
  product: ProductSummary,
  pricing?: ProductPricing,
): Record<string, string> {
  const metalValue = pricing ? Math.round(product.weightGram * pricing.livePriceToman) : undefined;

  return {
    وزن: `${product.weightGram} گرم`,
    اجرت: `${product.makingFeePercent} درصد`,
    رنگ: 'طلایی',
    عیار: `${product.karat} عیار`,
    'قیمت هر گرم (لحظه‌ای)': pricing
      ? formatTomanAmountWithUnit(pricing.livePriceToman)
      : '—',
    'ارزش خام طلا': metalValue ? formatTomanAmountWithUnit(metalValue) : '—',
    'مبلغ اجرت': pricing?.wageFixedToman
      ? formatTomanAmountWithUnit(pricing.wageFixedToman)
      : '—',
  };
}

export async function enrichProductDetails(product: ProductDetails): Promise<ProductDetails> {
  const enriched = await withLivePricing(product);

  return {
    ...enriched,
    color: product.color ?? 'طلایی',
    specifications: product.specifications ?? buildSpecifications(enriched, enriched.pricing),
    gallery: product.gallery?.map((url) =>
      resolveStorefrontProductImageUrl(url, product.category),
    ),
  };
}

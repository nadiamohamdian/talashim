import type { ProductDetails, ProductPricing, ProductSummary } from '@sadafgold/types';
import { serverFetch } from '@/lib/api/client';

function calculateJewelryPricing(input: {
  weightGram: number;
  livePricePerGramToman: number;
  karat: number;
  makingFeePercent: number;
  taxPercent?: number;
}): ProductPricing {
  const purityFactor = input.karat / 18;
  const gramPrice = Math.round(input.livePricePerGramToman * purityFactor);
  const metalValue = Math.round(input.weightGram * gramPrice);
  const wageAmount = Math.round(metalValue * (input.makingFeePercent / 100));
  const subtotal = metalValue + wageAmount;
  const taxPercent = input.taxPercent ?? 0;
  const taxAmount = Math.round(subtotal * (taxPercent / 100));

  return {
    livePriceToman: gramPrice,
    wagePercent: input.makingFeePercent,
    wageFixedToman: wageAmount,
    taxPercent,
    finalPriceToman: subtotal + taxAmount,
    pricedAt: new Date().toISOString(),
  };
}

function formatPricingBreakdown(pricing: ProductPricing, weightGram: number) {
  const metalValue = Math.round(weightGram * pricing.livePriceToman);
  return {
    metalValue,
    wageAmount: pricing.wageFixedToman ?? Math.round(metalValue * (pricing.wagePercent / 100)),
    taxAmount:
      pricing.taxPercent > 0
        ? Math.round((metalValue + (pricing.wageFixedToman ?? 0)) * (pricing.taxPercent / 100))
        : 0,
  };
}

export { formatPricingBreakdown };

export async function getLiveGoldPricePerGram(karat = 18): Promise<number> {
  const live = await serverFetch<{ pricePerGram: string }>(
    `/pricing/live?karat=${karat}&symbol=XAU-IRR`,
    { revalidate: 30 },
  );
  const price = Number(live.pricePerGram);
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error('Live gold price unavailable');
  }
  return price;
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

export async function withLivePricing<T extends ProductSummary>(product: T): Promise<T> {
  const livePrice = await getLiveGoldPricePerGram(product.karat);
  const pricing = buildProductPricing(product, livePrice);

  return {
    ...product,
    priceToman: pricing.finalPriceToman,
    pricing,
  };
}

export async function withLivePricingList(products: ProductSummary[]) {
  if (!products.length) return [];
  const livePrice = await getLiveGoldPricePerGram(18);
  return products.map((product) => {
    const pricing = buildProductPricing(product, livePrice);
    return { ...product, priceToman: pricing.finalPriceToman, pricing };
  });
}

export function buildSpecifications(
  product: ProductSummary,
  pricing?: ProductPricing,
): Record<string, string> {
  const metalValue = pricing
    ? Math.round(product.weightGram * pricing.livePriceToman)
    : undefined;

  return {
    وزن: `${product.weightGram} گرم`,
    اجرت: `${product.makingFeePercent} درصد`,
    رنگ: 'طلایی',
    عیار: `${product.karat} عیار`,
    'قیمت هر گرم (لحظه‌ای)': pricing
      ? `${pricing.livePriceToman.toLocaleString('fa-IR')} تومان`
      : '—',
    'ارزش خام طلا': metalValue
      ? `${metalValue.toLocaleString('fa-IR')} تومان`
      : '—',
    'مبلغ اجرت': pricing?.wageFixedToman
      ? `${pricing.wageFixedToman.toLocaleString('fa-IR')} تومان`
      : '—',
  };
}

export async function enrichProductDetails(product: ProductDetails): Promise<ProductDetails> {
  const enriched = await withLivePricing(product);

  return {
    ...enriched,
    color: product.color ?? 'طلایی',
    specifications: product.specifications ?? buildSpecifications(enriched, enriched.pricing),
  };
}

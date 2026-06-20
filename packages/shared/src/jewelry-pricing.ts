export interface ProductPricing {
  livePriceToman: number;
  wagePercent: number;
  wageFixedToman?: number;
  taxPercent: number;
  finalPriceToman: number;
  pricedAt: string;
}

export interface JewelryPricingInput {
  weightGram: number;
  livePricePerGramToman: number;
  karat: number;
  makingFeePercent: number;
  taxPercent?: number;
}

/** Jewelry final price: (weight × live gram price × purity) + wage + tax */
export function calculateJewelryPricing(input: JewelryPricingInput): ProductPricing {
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

export interface ProductDiscountInput {
  discountPercent?: number | null;
  discountStartsAt?: string | Date | null;
  discountEndsAt?: string | Date | null;
  compareAtPriceToman?: number | null;
}

export function isProductDiscountActive(
  product: ProductDiscountInput,
  now: Date = new Date(),
): boolean {
  const percent = product.discountPercent;
  if (percent == null || percent <= 0 || !product.discountEndsAt) {
    return false;
  }

  const endsAt = new Date(product.discountEndsAt);
  if (Number.isNaN(endsAt.getTime()) || endsAt <= now) {
    return false;
  }

  if (product.discountStartsAt) {
    const startsAt = new Date(product.discountStartsAt);
    if (!Number.isNaN(startsAt.getTime()) && startsAt > now) {
      return false;
    }
  }

  return true;
}

export function applyDiscountToPrice(finalPriceToman: number, discountPercent: number): number {
  return Math.round(finalPriceToman * (1 - discountPercent / 100));
}

function withActiveDiscount<
  T extends ProductDiscountInput & { priceToman: number },
>(product: T, basePriceToman: number): T {
  if (!isProductDiscountActive(product) || product.discountPercent == null) {
    return { ...product, priceToman: basePriceToman, compareAtPriceToman: null };
  }

  return {
    ...product,
    compareAtPriceToman: basePriceToman,
    priceToman: applyDiscountToPrice(basePriceToman, product.discountPercent),
  };
}

export function applyLivePricingToProduct<
  T extends ProductDiscountInput & {
    weightGram: number;
    karat: number;
    makingFeePercent: number;
    priceToman: number;
    pricing?: ProductPricing;
  },
>(product: T, livePricePerGramToman: number): T {
  const pricing = calculateJewelryPricing({
    weightGram: product.weightGram,
    livePricePerGramToman,
    karat: product.karat,
    makingFeePercent: product.makingFeePercent,
  });

  return withActiveDiscount(
    {
      ...product,
      pricing,
    },
    pricing.finalPriceToman,
  );
}

export function applyLivePricingToProducts<
  T extends ProductDiscountInput & {
    weightGram: number;
    karat: number;
    makingFeePercent: number;
    priceToman: number;
    pricing?: ProductPricing;
  },
>(products: T[], livePriceByKarat: ReadonlyMap<number, number>): T[] {
  return products.map((product) => {
    const livePrice =
      livePriceByKarat.get(product.karat) ?? livePriceByKarat.get(18) ?? 0;
    if (!livePrice) {
      return product;
    }
    return applyLivePricingToProduct(product, livePrice);
  });
}

export function formatPricingBreakdown(pricing: ProductPricing, weightGram: number) {
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

export function generateProductSku(category: string, weightGram: number, sequence = 1): string {
  const prefixMap: Record<string, string> = {
    ring: 'R',
    necklace: 'N',
    bracelet: 'B',
    coin: 'C',
    earring: 'E',
  };
  const prefix = prefixMap[category.toLowerCase()] ?? 'P';
  const weightPart = Math.round(weightGram * 100)
    .toString()
    .padStart(4, '0');
  return `SG-${prefix}-${weightPart}-${sequence.toString().padStart(2, '0')}`;
}

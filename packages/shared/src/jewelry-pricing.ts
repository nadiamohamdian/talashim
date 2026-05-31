import type { ProductPricing } from '@sadafgold/types';

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

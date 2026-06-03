'use client';

import { useMemo } from 'react';
import { applyLivePricingToProduct } from '@sadafgold/shared';
import type { ProductPricing, ProductSummary } from '@sadafgold/types';
import { useMarketPrices } from '@/lib/api/hooks/use-market-prices';

type PricedProduct = Pick<
  ProductSummary,
  'weightGram' | 'karat' | 'makingFeePercent' | 'priceToman' | 'pricing'
>;

export function useDynamicProductPrice<T extends PricedProduct>(product: T): T {
  const { data: liveQuote } = useMarketPrices({ karat: product.karat });

  return useMemo(() => {
    const livePerGram = Number(liveQuote?.pricePerGram ?? 0);
    if (!Number.isFinite(livePerGram) || livePerGram <= 0) {
      return product;
    }
    return applyLivePricingToProduct(product, livePerGram);
  }, [
    product.weightGram,
    product.karat,
    product.makingFeePercent,
    product.priceToman,
    product.pricing?.pricedAt,
    liveQuote?.pricePerGram,
    liveQuote?.recordedAt,
  ]);
}

export function useDynamicProductPricing(product: PricedProduct): ProductPricing | undefined {
  return useDynamicProductPrice(product).pricing;
}

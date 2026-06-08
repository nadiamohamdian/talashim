import { calculateJewelryPricing } from './jewelry-pricing';

export interface OrderLinePricingSnapshot {
  weightGram: number;
  karat: number;
  makingFeePercent: number;
  liveGoldPricePerGramToman: number;
  liveGoldPrice18PerGramToman: number;
  metalValueToman: number;
  wageToman: number;
  lineSubtotalToman: number;
  lineTaxToman: number;
  unitPriceToman: number;
}

export function buildOrderLinePricingSnapshot(input: {
  weightGram: number;
  karat: number;
  makingFeePercent: number;
  livePricePerGramToman: number;
  taxPercent: number;
}): OrderLinePricingSnapshot {
  const pricing = calculateJewelryPricing({
    weightGram: input.weightGram,
    livePricePerGramToman: input.livePricePerGramToman,
    karat: input.karat,
    makingFeePercent: input.makingFeePercent,
    taxPercent: input.taxPercent,
  });

  const purityFactor = input.karat / 18;
  const liveGoldPricePerGramToman = Math.round(input.livePricePerGramToman * purityFactor);
  const metalValueToman = Math.round(input.weightGram * liveGoldPricePerGramToman);
  const wageToman =
    pricing.wageFixedToman ?? Math.round(metalValueToman * (input.makingFeePercent / 100));
  const lineSubtotalToman = metalValueToman + wageToman;
  const lineTaxToman = pricing.finalPriceToman - lineSubtotalToman;

  return {
    weightGram: input.weightGram,
    karat: input.karat,
    makingFeePercent: input.makingFeePercent,
    liveGoldPricePerGramToman,
    liveGoldPrice18PerGramToman: input.livePricePerGramToman,
    metalValueToman,
    wageToman,
    lineSubtotalToman,
    lineTaxToman,
    unitPriceToman: pricing.finalPriceToman,
  };
}

export function reconstructOrderLinePricing(input: {
  unitPriceToman: number;
  weightGram: number;
  karat: number;
  makingFeePercent: number;
  taxPercent: number;
}): OrderLinePricingSnapshot {
  const lineSubtotalToman = Math.round(input.unitPriceToman / (1 + input.taxPercent / 100));
  const metalValueToman = Math.round(lineSubtotalToman / (1 + input.makingFeePercent / 100));
  const wageToman = lineSubtotalToman - metalValueToman;
  const purityFactor = input.karat / 18;
  const weightFactor = input.weightGram * purityFactor;
  const liveGoldPricePerGramToman =
    weightFactor > 0 ? Math.round(metalValueToman / weightFactor) : 0;
  const liveGoldPrice18PerGramToman =
    purityFactor > 0 ? Math.round(liveGoldPricePerGramToman / purityFactor) : 0;
  const lineTaxToman = input.unitPriceToman - lineSubtotalToman;

  return {
    weightGram: input.weightGram,
    karat: input.karat,
    makingFeePercent: input.makingFeePercent,
    liveGoldPricePerGramToman,
    liveGoldPrice18PerGramToman,
    metalValueToman,
    wageToman,
    lineSubtotalToman,
    lineTaxToman,
    unitPriceToman: input.unitPriceToman,
  };
}

export function formatWeightGramFa(weightGram: number): string {
  return weightGram.toLocaleString('fa-IR', {
    minimumFractionDigits: weightGram % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

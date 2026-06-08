export type TradeQuantityUnit = 'gram' | 'sot';

/** Iranian gold market: ۱ گرم = ۱٬۰۰۰ سوت */
export const SOTS_PER_GRAM = 1_000;

export function sotToGram(sot: number): number {
  return sot / SOTS_PER_GRAM;
}

export function gramToSot(gram: number): number {
  return gram * SOTS_PER_GRAM;
}

export function parseQuantityToGram(
  quantity: string,
  unit: TradeQuantityUnit,
): number | null {
  const num = Number(quantity);
  if (!Number.isFinite(num) || num <= 0) {
    return null;
  }
  return unit === 'gram' ? num : sotToGram(num);
}

export function formatQuantityForUnit(gram: number, unit: TradeQuantityUnit): string {
  if (unit === 'sot') {
    return String(Math.round(gramToSot(gram)));
  }
  if (gram >= 0.01) {
    return String(gram);
  }
  return gram.toFixed(4).replace(/\.?0+$/, '');
}

export function formatGramQuantityLabel(gram: number): string {
  if (gram >= 0.01) {
    return `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 4 }).format(gram)} گرم`;
  }
  const sot = Math.round(gramToSot(gram));
  return `${new Intl.NumberFormat('fa-IR').format(sot)} سوت`;
}

export function formatSotQuantityLabel(sot: number): string {
  return `${new Intl.NumberFormat('fa-IR').format(Math.round(sot))} سوت`;
}

export function quantityGramToApiString(gram: number): string {
  return gram.toFixed(6).replace(/\.?0+$/, '');
}

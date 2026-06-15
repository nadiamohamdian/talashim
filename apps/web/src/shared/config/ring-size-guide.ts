export interface RingSizeChartRow {
  circumferenceMm: number;
  ringSize: number;
}

/** Figma node 1752:7108 — ring size conversion table */
export const RING_SIZE_CHART_ROWS: RingSizeChartRow[] = [
  { circumferenceMm: 49, ringSize: 50 },
  { circumferenceMm: 51, ringSize: 52 },
  { circumferenceMm: 54, ringSize: 54 },
  { circumferenceMm: 56, ringSize: 56 },
  { circumferenceMm: 58, ringSize: 58 },
];

export const RING_SIZE_GUIDE_TIPS: string[] = [
  'بهترین زمان اندازه‌گیری، دمای معمولی بدن است.',
  'در هوای بسیار سرد یا گرم، اندازه انگشت ممکن است تغییر کند.',
  'اگر بین دو سایز قرار دارید، سایز بزرگ‌تر را انتخاب کنید.',
  'برای انگشترهای پهن، معمولاً یک سایز بزرگ‌تر راحت‌تر است.',
];

export const RING_SIZE_GUIDE_PATH = '/guides/ring-size';

export const RING_SIZE_GUIDE_DIAGRAM_IMAGE = '/images/guides/ring-size-diagram.png';

export function buildRingSizeGuideHref(returnTo: string): string {
  return `${RING_SIZE_GUIDE_PATH}?from=${encodeURIComponent(returnTo)}`;
}

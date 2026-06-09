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

export function buildRingSizeGuideHref(returnTo: string): string {
  return `${RING_SIZE_GUIDE_PATH}?from=${encodeURIComponent(returnTo)}`;
}

/** Figma Group 317 — concentric circle specs (absolute frame coords). */
export const RING_SIZE_GUIDE_CIRCLES = [
  { diameter: 145, x: 122, y: 228 },
  { diameter: 122, x: 134, y: 240 },
  { diameter: 99, x: 145, y: 251 },
  { diameter: 78, x: 156, y: 261 },
  { diameter: 57, x: 166, y: 272 },
] as const;

/** Gold guide lines + labels (absolute frame coords). */
export const RING_SIZE_GUIDE_MARKERS = [
  { size: 55, lineX: 195, lineTop: 328, lineBottom: 468, labelX: 188, labelY: 468 },
  { size: 54, lineX: 210, lineTop: 328, lineBottom: 454, labelX: 204, labelY: 454 },
  { size: 53, lineX: 227, lineTop: 334, lineBottom: 439, labelX: 221, labelY: 439 },
  { size: 52, lineX: 244, lineTop: 336, lineBottom: 421, labelX: 238, labelY: 421 },
  { size: 51, lineX: 259, lineTop: 332, lineBottom: 407, labelX: 254, labelY: 407 },
] as const;

export const RING_SIZE_GUIDE_DIAGRAM_VIEWBOX = '118 225 150 252';

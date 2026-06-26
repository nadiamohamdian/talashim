export interface RingSizeChartRow {
  circumferenceMm: number;
  ringSize: number;
}

export interface RingSizeGuideDiagramItem {
  diameterPx: number;
  label: number;
}

export interface RingSizeGuideMobileMarker {
  label: number;
  lineHeightPx: number;
  lineTopPx: number;
  leftPx: number;
  labelTopPx: number;
}

/** Figma node 1752:7108 - ring size conversion table */
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

/** Figma node 3626:2863 - desktop hero copy */
export const RING_SIZE_GUIDE_LEAD_DESKTOP =
  'اگر انگشتری دارید که اندازه آن برای شما مناسب است، آن را روی دایره‌های زیر قرار دهید و با دقت مقایسه کنید. دایره‌ای را انتخاب کنید که لبه داخلی انگشتر دقیقاً با محیط آن منطبق باشد و هیچ فاصله یا هم‌پوشانی قابل توجهی بین آن‌ها وجود نداشته باشد. عدد مربوط به همان دایره، نزدیک‌ترین سایز انگشتر شما خواهد بود.';

export const RING_SIZE_GUIDE_FOOTNOTE =
  'این سایزبندی بر اساس مچ دست استاندارد (۱۵ تا ۱۶ سانتی‌متر) طراحی شده است';

/** Figma Group 614 - desktop horizontal ring circles (smallest to largest) */
export const RING_SIZE_GUIDE_DIAGRAM_ITEMS: ReadonlyArray<RingSizeGuideDiagramItem> = [
  { diameterPx: 57, label: 51 },
  { diameterPx: 78, label: 52 },
  { diameterPx: 99, label: 53 },
  { diameterPx: 122, label: 54 },
  { diameterPx: 145, label: 55 },
];

/** Figma Group 317 - mobile concentric circles (largest to smallest, for paint order) */
export const RING_SIZE_GUIDE_MOBILE_CIRCLE_DIAMETERS_PX: readonly number[] = [145, 122, 99, 78, 57];

/** Figma Group 317 - mobile size markers (largest to smallest, left to right) */
export const RING_SIZE_GUIDE_MOBILE_MARKERS: ReadonlyArray<RingSizeGuideMobileMarker> = [
  { label: 55, lineHeightPx: 105, lineTopPx: 100, leftPx: 66, labelTopPx: 240 },
  { label: 54, lineHeightPx: 134, lineTopPx: 100, leftPx: 82, labelTopPx: 225.91 },
  { label: 53, lineHeightPx: 113, lineTopPx: 106, leftPx: 99, labelTopPx: 211 },
  { label: 52, lineHeightPx: 97, lineTopPx: 108, leftPx: 116, labelTopPx: 193 },
  { label: 51, lineHeightPx: 77, lineTopPx: 109, leftPx: 132, labelTopPx: 179 },
];

export const RING_SIZE_GUIDE_PATH = '/guides/ring-size';

export const RING_SIZE_GUIDE_DIAGRAM_IMAGE = '/images/guides/ring-size-diagram.png';

export function buildRingSizeGuideHref(returnTo: string): string {
  return `${RING_SIZE_GUIDE_PATH}?from=${encodeURIComponent(returnTo)}`;
}

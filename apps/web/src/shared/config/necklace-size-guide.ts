export interface NecklaceSizeChartRow {
  lengthLabel: string;
  placement: string;
}

/** Figma node 3552:4262 — mobile size chart */
export const NECKLACE_SIZE_CHART_ROWS: NecklaceSizeChartRow[] = [
  { lengthLabel: '49 میلی‌متر', placement: 'کاملاً چسبیده به گردن' },
  { lengthLabel: '51 میلی‌متر', placement: 'روی خط گردن می‌نشیند' },
  { lengthLabel: '54 میلی‌متر', placement: 'روی استخوان ترقوه' },
  { lengthLabel: '56 میلی‌متر', placement: 'کمی پایین‌تر از ترقوه (استاندارد)' },
  { lengthLabel: '58 میلی‌متر', placement: 'روی بالای سینه' },
  { lengthLabel: '54 میلی‌متر', placement: 'وسط سینه' },
  { lengthLabel: '56 میلی‌متر', placement: 'زیر سینه (استایل لایه‌ای)' },
  { lengthLabel: '58 میلی‌متر', placement: 'برای استایل‌های چندلایه یا آویزدار' },
];

/** Figma node 3619:3532 — desktop size chart (same lengths as mobile, larger typography via CSS) */
export const NECKLACE_SIZE_CHART_ROWS_DESKTOP: NecklaceSizeChartRow[] = [
  { lengthLabel: '49 میلی‌متر', placement: 'کاملاً چسبیده به گردن' },
  { lengthLabel: '51 میلی‌متر', placement: 'روی خط گردن می‌نشیند' },
  { lengthLabel: '54 میلی‌متر', placement: 'روی استخوان ترقوه' },
  { lengthLabel: '56 میلی‌متر', placement: 'کمی پایین‌تر از ترقوه (استاندارد)' },
  { lengthLabel: '58 میلی‌متر', placement: 'روی بالای سینه' },
  { lengthLabel: '54 میلی‌متر', placement: 'وسط سینه' },
  { lengthLabel: '56 میلی‌متر', placement: 'زیر سینه (استایل لایه‌ای)' },
  { lengthLabel: '58 میلی‌متر', placement: 'برای استایل‌های چندلایه یا آویزدار' },
];

export const NECKLACE_SIZE_GUIDE_INFO = {
  subtitle: 'راهنمای طول و نحوه قرارگیری گردنبند',
  body: 'این سایزبندی بر اساس گردن استاندارد (دور گردن حدود ۳۳ تا ۳۶ سانتی‌متر) طراحی شده است.',
};

/** Figma node 3619:3532 — desktop hero copy */
export const NECKLACE_SIZE_GUIDE_LEAD_DESKTOP =
  'اگر درباره انتخاب طول مناسب مطمئن نیستید، یک نخ یا متر را دور گردن خود قرار دهید و آن را تا محل دلخواه قرارگیری گردنبند تنظیم کنید. سپس طول به‌دست‌آمده را اندازه بگیرید و با گزینه‌های موجود در راهنمای سایزبندی مقایسه کنید تا انتخابی متناسب با استایل و سلیقه خود داشته باشید.';

export const NECKLACE_SIZE_GUIDE_FOOTNOTE =
  'سایزبندی بر اساس گردن استاندارد (دور گردن ۳۳ تا ۳۶ سانتی‌متر) طراحی شده است.';

export const NECKLACE_SIZE_GUIDE_TIPS: string[] = [
  'طول گردنبندها ممکن است روی بدن افراد مختلف کمی متفاوت دیده شود (بسته به فرم گردن و شانه).',
  'اگر بین دو سایز مردد هستید، سایز بلندتر معمولاً انتخاب امن‌تری است.',
  'مدل‌های آویزدار معمولاً کمی پایین‌تر از حالت استاندارد قرار می‌گیرند.',
  'برای استایل لایه‌ای، ترکیب دو سایز متفاوت جلوه زیباتری دارد.',
  'گردنبندهای چوکر برای همه فرم گردن مناسب نیستند؛ اگر گردن درشت‌تر دارید، سایز ۴۰ یا ۴۵cm راحت‌تر است.',
  'اندازه‌گیری دقیق با متر نرم یا نخ و خط‌کش بهترین روش انتخاب سایز است.',
  'ضخامت زنجیر هم در حس نهایی طول تأثیر دارد (زنجیرهای ضخیم کوتاه‌تر دیده می‌شوند).',
];

export const NECKLACE_SIZE_GUIDE_PATH = '/guides/necklace-size';

export function buildNecklaceSizeGuideHref(returnTo: string): string {
  return `${NECKLACE_SIZE_GUIDE_PATH}?from=${encodeURIComponent(returnTo)}`;
}

export interface BraceletSizeChartRow {
  lengthLabel: string;
  placement: string;
}

/** Figma node 1752:7217 */
export const BRACELET_SIZE_CHART_ROWS: BraceletSizeChartRow[] = [
  { lengthLabel: '49 میلی‌متر', placement: 'چسبیده به مچ' },
  { lengthLabel: '51 میلی‌متر', placement: 'کمی آزاد' },
  { lengthLabel: '54 میلی‌متر', placement: 'آزاد و افتاده' },
  { lengthLabel: '56 میلی‌متر', placement: 'خیلی آزاد و افتاده' },
];

export const BRACELET_SIZE_GUIDE_INFO = {
  subtitle: 'راهنمای انتخاب سایز دستبند',
  body: 'این سایزبندی بر اساس مچ دست استاندارد (حدود ۱۵ تا ۱۶ سانتی‌متر) طراحی شده است',
};

export const BRACELET_SIZE_GUIDE_TIPS: string[] = [
  'اگر بین دو سایز مردد هستید، سایز بزرگ‌تر انتخاب امن‌تری است.',
  'دستبندهای ظریف معمولاً فیت‌تر روی دست می‌ایستند، اما مدل‌های زنجیری یا سنگین‌تر کمی آزادتر دیده می‌شوند.',
  'مدل‌های آویزدار معمولاً کمی پایین‌تر از حالت استاندارد قرار می‌گیرند.',
  'برای استایل لایه‌ای، ترکیب دو سایز متفاوت جلوه زیباتری دارد.',
  'برای راحتی بیشتر، بهتر است ۱ تا ۱.۵ سانت به اندازه دور مچ اضافه کنید.',
  'اگر دستبند دارای قفل یا آویز است، فضای بیشتری برای حرکت در نظر بگیرید.',
  'در طول روز (به‌خصوص در گرما) ممکن است مچ کمی تغییر سایز بدهد؛ این موضوع را در انتخاب سایز در نظر بگیرید.',
  'برای استایل لایه‌ای (چند دستبند هم‌زمان)، سایز کمی آزادتر جلوه بهتری دارد.',
];

export const BRACELET_SIZE_GUIDE_PATH = '/guides/bracelet-size';

export function buildBraceletSizeGuideHref(returnTo: string): string {
  return `${BRACELET_SIZE_GUIDE_PATH}?from=${encodeURIComponent(returnTo)}`;
}

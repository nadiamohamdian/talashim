export type ProductPdpSizeKind = 'ring' | 'necklace' | 'bracelet';

export interface ProductPdpStoneSwatch {
  id: string;
  color: string;
  label: string;
}

export const PRESET_GOLD_COLORS = ['طلایی', 'رزگلد', 'سفید'] as const;

export const PRESET_STONE_SWATCHES: ProductPdpStoneSwatch[] = [
  { id: 'pink', color: '#F2D4D9', label: 'صورتی' },
  { id: 'purple', color: '#D8CCE8', label: 'بنفش' },
  { id: 'blue', color: '#C8D9ED', label: 'آبی' },
  { id: 'gray', color: '#D9D9D9', label: 'خاکستری' },
];

export const PRESET_SIZE_OPTIONS: Record<ProductPdpSizeKind, number[]> = {
  ring: [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63],
  necklace: [40, 42, 45, 48, 50, 55],
  bracelet: [16, 17, 18, 19, 20, 21],
};

export const PRESET_SIZE_KIND_LABELS: Record<ProductPdpSizeKind, string> = {
  ring: 'انگشتر',
  necklace: 'گردنبند',
  bracelet: 'دستبند',
};

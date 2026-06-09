export type ProductListingSortOptionId =
  | 'best-selling'
  | 'discounts'
  | 'price-desc'
  | 'price-asc'
  | 'new-collection';

export interface ProductListingSortOption {
  id: ProductListingSortOptionId;
  label: string;
}

/** Figma node 1752:7271 */
export const PRODUCT_LISTING_SORT_OPTIONS: ProductListingSortOption[] = [
  { id: 'best-selling', label: 'پرفروش ترین' },
  { id: 'discounts', label: 'تخفیف ها' },
  { id: 'price-desc', label: 'گران ترین' },
  { id: 'price-asc', label: 'ارزان ترین' },
  { id: 'new-collection', label: 'کالکشن جدید' },
];

export interface ProductListingFilterOption {
  id: string;
  label: string;
}

export interface ProductListingFilterSection {
  id: string;
  title: string;
  options: ProductListingFilterOption[];
}

export type ProductListingGoldColorId = 'gold' | 'rose-gold' | 'white';

export interface ProductListingGoldColorOption {
  id: ProductListingGoldColorId;
  label: string;
}

/** Figma node 1752:7288 */
export const PRODUCT_LISTING_FILTER_SECTIONS: ProductListingFilterSection[] = [
  {
    id: 'price',
    title: 'فیلتر براساس قیمت',
    options: [
      { id: 'price-1-3', label: '1 - 3 میلیون تومان' },
      { id: 'price-4-8', label: '4 - 8 میلیون تومان' },
      { id: 'price-9-15', label: '9 - 15 میلیون تومان' },
      { id: 'price-16-plus', label: 'بالای 16 میلیون تومان' },
    ],
  },
  {
    id: 'weight',
    title: 'فیلتر براساس وزن',
    options: [
      { id: 'weight-under-2', label: 'کمتر از 2 گرم' },
      { id: 'weight-2-5', label: '2 - 5 گرم' },
      { id: 'weight-6-9', label: '6 - 9 گرم' },
      { id: 'weight-10-plus', label: 'بالای 10 گرم' },
    ],
  },
  {
    id: 'ring-type',
    title: 'فیلتر براساس نوع انگشتر',
    options: [
      { id: 'type-minimal', label: 'مینیمال' },
      { id: 'type-set', label: 'انگشتر ست' },
      { id: 'type-gem', label: 'نگین دار' },
      { id: 'type-kids', label: 'کودکانه' },
      { id: 'type-men', label: 'مردانه' },
    ],
  },
];

export const PRODUCT_LISTING_GOLD_COLOR_OPTIONS: ProductListingGoldColorOption[] = [
  { id: 'gold', label: 'طلایی' },
  { id: 'rose-gold', label: 'رزگلد' },
  { id: 'white', label: 'سفید' },
];

export const PRODUCT_LISTING_GOLD_COLOR_SECTION_TITLE = 'فیلتر براساس رنگ طلا';

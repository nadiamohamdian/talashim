import type {
  CatalogCategoryFilterConfig,
  CatalogCategoryFilterSection,
  CatalogCategorySortOption,
} from '@sadafgold/types';

export const DEFAULT_CATALOG_CATEGORY_SORT_OPTIONS: CatalogCategorySortOption[] = [
  { id: 'best-selling', label: 'پرفروش ترین', field: 'sales', direction: 'desc' },
  { id: 'discounts', label: 'تخفیف ها', field: 'createdAt', direction: 'desc', discountOnly: true },
  { id: 'price-desc', label: 'گران ترین', field: 'priceToman', direction: 'desc' },
  { id: 'price-asc', label: 'ارزان ترین', field: 'priceToman', direction: 'asc' },
  { id: 'new-collection', label: 'کالکشن جدید', field: 'createdAt', direction: 'desc' },
];

const PRICE_FILTER_SECTION: CatalogCategoryFilterSection = {
  id: 'price',
  title: 'فیلتر قیمت',
  options: [
    { id: 'price-1-3', label: '1 - 3 میلیون تومان', minPrice: 0, maxPrice: 3_000_000 },
    { id: 'price-4-8', label: '4 - 8 میلیون تومان', minPrice: 4_000_000, maxPrice: 8_000_000 },
    { id: 'price-9-15', label: '9 - 15 میلیون تومان', minPrice: 9_000_000, maxPrice: 15_000_000 },
    { id: 'price-16-plus', label: 'بالای 16 میلیون تومان', minPrice: 16_000_000 },
  ],
};

const WEIGHT_FILTER_SECTION: CatalogCategoryFilterSection = {
  id: 'weight',
  title: 'فیلتر وزن',
  options: [
    { id: 'weight-under-2', label: 'کمتر از 2 گرم', maxWeight: 2 },
    { id: 'weight-2-5', label: '2 - 5 گرم', minWeight: 2, maxWeight: 5 },
    { id: 'weight-6-9', label: '6 - 9 گرم', minWeight: 6, maxWeight: 9 },
    { id: 'weight-10-plus', label: 'بالای 10 گرم', minWeight: 10 },
  ],
};

const RING_TYPE_FILTER_SECTION: CatalogCategoryFilterSection = {
  id: 'ring-type',
  title: 'فیلتر نوع انگشتر',
  options: [
    { id: 'type-minimal', label: 'مینیمال', searchTerms: ['مینیمال', 'minimal'] },
    { id: 'type-set', label: 'انگشتر ست', searchTerms: ['ست', 'set'] },
    { id: 'type-gem', label: 'نگین دار', searchTerms: ['نگین', 'gem'] },
    { id: 'type-kids', label: 'کودکانه', searchTerms: ['کودک', 'kids'] },
    { id: 'type-men', label: 'مردانه', searchTerms: ['مردانه', 'men'] },
  ],
};

export function buildDefaultCatalogCategoryFilterConfig(
  slug: string,
): CatalogCategoryFilterConfig {
  const filterSections: CatalogCategoryFilterSection[] = [
    PRICE_FILTER_SECTION,
    WEIGHT_FILTER_SECTION,
  ];

  if (slug === 'rings') {
    filterSections.push(RING_TYPE_FILTER_SECTION);
  }

  return {
    sortOptions: DEFAULT_CATALOG_CATEGORY_SORT_OPTIONS.map((option) => ({ ...option })),
    filterSections: filterSections.map((section) => ({
      ...section,
      options: section.options.map((option) => ({ ...option })),
    })),
  };
}

export interface DefaultCatalogCategorySeed {
  slug: string;
  title: string;
  subtitle: string;
  productCategory: 'RING' | 'NECKLACE' | 'BRACELET' | 'EARRING' | 'COIN' | 'WEDDING_RING' | 'CHILDREN' | 'SET_AND_HALF_SET' | null;
  sortOrder: number;
}

export const DEFAULT_CATALOG_CATEGORY_SEEDS: DefaultCatalogCategorySeed[] = [
  {
    slug: 'rings',
    title: 'انگشتر زنانه',
    subtitle: 'خرید انگشتر طلا با ضمانت اصالت و ارسال سریع',
    productCategory: 'RING',
    sortOrder: 0,
  },
  {
    slug: 'necklaces',
    title: 'گردنبند زنانه',
    subtitle: 'خرید گردنبند طلا با ضمانت اصالت و ارسال سریع',
    productCategory: 'NECKLACE',
    sortOrder: 1,
  },
  {
    slug: 'bracelets',
    title: 'دستبند زنانه',
    subtitle: 'خرید دستبند طلا با ضمانت اصالت و ارسال سریع',
    productCategory: 'BRACELET',
    sortOrder: 2,
  },
  {
    slug: 'earrings',
    title: 'گوشواره زنانه',
    subtitle: 'خرید گوشواره طلا با ضمانت اصالت و ارسال سریع',
    productCategory: 'EARRING',
    sortOrder: 3,
  },
  {
    slug: 'sets',
    title: 'ست و نیم‌ست زنانه',
    subtitle: 'خرید ست و نیم‌ست طلا با ضمانت اصالت و ارسال سریع',
    productCategory: 'SET_AND_HALF_SET',
    sortOrder: 4,
  },
  {
    slug: 'wedding-rings',
    title: 'حلقه ازدواج',
    subtitle: 'خرید حلقه ازدواج طلا با ضمانت اصالت و ارسال سریع',
    productCategory: 'WEDDING_RING',
    sortOrder: 5,
  },
  {
    slug: 'coins',
    title: 'سکه',
    subtitle: 'خرید سکه طلا با ضمانت اصالت و ارسال سریع',
    productCategory: 'COIN',
    sortOrder: 6,
  },
  {
    slug: 'kids',
    title: 'طلای کودکانه',
    subtitle: 'انگشتر، دستبند، گردنبند و گوشواره طلا با طراحی ایمن برای کودکان',
    productCategory: 'CHILDREN',
    sortOrder: 7,
  },
];

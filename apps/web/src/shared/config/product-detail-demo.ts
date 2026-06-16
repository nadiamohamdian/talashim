import type { ProductCategory, ProductDetails, ProductSummary, ProductVariant, ProductVideo } from '@sadafgold/types';
import type { HomeProductCarouselItem } from '@/shared/config/storefront-ia';
import { CATEGORY_FALLBACK_IMAGES } from '@/shared/config/images';
import { PRODUCT_LISTING_DEMO_PRODUCTS } from '@/shared/config/product-listing-demo';
import { findCatalogDemoProduct } from '@talashim/shared/constants/demo-products';
import { resolveProductJewelrySizeKinds } from '@/shared/lib/catalog-category';
import { resolvePdpSections } from '@/shared/lib/resolve-product-pdp-config';

export interface ProductReviewDemo {
  id: string;
  author: string;
  rating: number;
  date: string;
  body: string;
}

export const DEFAULT_FEATURED_REVIEW: ProductReviewDemo = {
  id: 'default-featured-review',
  author: 'نام و نام خانوادگی کاربر',
  rating: 5,
  date: '',
  body: 'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است.',
};

export const DEMO_PRODUCT_REVIEWS: ProductReviewDemo[] = [
  DEFAULT_FEATURED_REVIEW,
  {
    id: 'demo-review-2',
    author: 'مریم حسینی',
    rating: 4.5,
    date: '',
    body: 'کیفیت ساخت و درخشش طلا عالی بود. بسته‌بندی هم بسیار شیک و مطمئن ارسال شد.',
  },
  {
    id: 'demo-review-3',
    author: 'علی رضایی',
    rating: 5,
    date: '',
    body: 'طراحی مینیمال و ظریف؛ دقیقاً همان چیزی بود که دنبالش بودم. پیشنهاد می‌کنم.',
  },
];

export interface ProductSpecRow {
  label: string;
  value: string;
}

export interface StoneColorSwatch {
  id: string;
  color: string;
  label: string;
}

export interface ProductDetailDemo extends ProductDetails {
  gallery: string[];
  heroImageUrl: string;
  displayPriceToman: number;
  ringSizes: number[];
  necklaceSizes?: number[];
  braceletSizes?: number[];
  goldColors: string[];
  stoneSwatches: StoneColorSwatch[];
  specRows: ProductSpecRow[];
  featuredReview: ProductReviewDemo;
  relatedProducts: HomeProductCarouselItem[];
  ratingAverage: number;
  reviewCount: number;
  reviews: ProductReviewDemo[];
  videos: ProductVideo[];
}

const DEMO_PRODUCT_VIDEOS: ProductVideo[] = [
  {
    id: 'demo-product-video',
    title: 'ویدیو معرفی محصول',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
    thumbnailUrl: '/images/products/pdp-hero.png',
    sortOrder: 0,
  },
];

const DEMO_VARIANTS: ProductVariant[] = [
  {
    id: 'variant-gold-57',
    sku: 'RNG-LUX-57-G',
    color: 'طلایی',
    size: '57',
    priceToman: 17_548_000,
    weightGram: 2.8,
    makingFeePercent: 24,
    imageUrl: '/images/home/new-arrival-lifestyle.png',
    quantity: 3,
    isDefault: true,
  },
  {
    id: 'variant-rosegold-57',
    sku: 'RNG-LUX-57-R',
    color: 'رزگلد',
    size: '57',
    priceToman: 17_548_000,
    weightGram: 2.8,
    makingFeePercent: 24,
    imageUrl: '/images/home/new-arrival-lifestyle.png',
    quantity: 2,
    isDefault: false,
  },
  {
    id: 'variant-white-57',
    sku: 'RNG-LUX-57-W',
    color: 'سفید',
    size: '57',
    priceToman: 17_800_000,
    weightGram: 2.8,
    makingFeePercent: 24,
    imageUrl: '/images/home/new-arrival-lifestyle.png',
    quantity: 1,
    isDefault: false,
  },
];

const DEMO_STONE_SWATCHES: StoneColorSwatch[] = [
  { id: 'pink', color: '#F2D4D9', label: 'صورتی' },
  { id: 'purple', color: '#D8CCE8', label: 'بنفش' },
  { id: 'blue', color: '#C8D9ED', label: 'آبی' },
  { id: 'gray', color: '#D9D9D9', label: 'خاکستری' },
];

const DEMO_SPEC_ROWS: ProductSpecRow[] = [
  { label: 'مالیات', value: '۴۹۸,۰۰۰ تومان' },
  { label: 'اجرت', value: '۲۴٪' },
  { label: 'نوع سنگ', value: 'زیرکن اتمی' },
  { label: 'تعداد سنگ', value: '۲۴ عدد' },
  { label: 'نوع زنجیر', value: 'فاکس' },
  { label: 'نوع قفل', value: 'خرچنگی' },
];

export const DEFAULT_RELATED_PRODUCTS: HomeProductCarouselItem[] = [
  {
    id: 'related-1',
    title: 'انگشتر زنانه لوکس بیضی',
    priceToman: 8_500_000,
    weightGram: 2.8,
    imageUrl: '/images/home/new-arrival-necklace.png',
    href: '/products/demo',
  },
  {
    id: 'related-2',
    title: 'انگشتر کلاسیک طلا',
    priceToman: 9_800_000,
    weightGram: 3.1,
    imageUrl: CATEGORY_FALLBACK_IMAGES.rings,
    href: '/products/demo-classic-ring',
  },
  {
    id: 'related-3',
    title: 'گوشواره آذین مدل نجو',
    priceToman: 11_200_000,
    weightGram: 2.4,
    imageUrl: CATEGORY_FALLBACK_IMAGES.earrings,
    href: '/products/demo-earring',
  },
  {
    id: 'related-4',
    title: 'گردنبند مینیمال',
    priceToman: 12_500_000,
    weightGram: 4.2,
    imageUrl: CATEGORY_FALLBACK_IMAGES.necklaces,
    href: '/products/demo-necklace',
  },
];

export const PRODUCT_DETAIL_DEMO: ProductDetailDemo = {
  id: 'demo-product-1',
  sku: 'DEMO-1',
  slug: 'demo',
  title: 'انگشتر زنانه لوکس بیضی',
  category: 'RING',
  karat: 18,
  weightGram: 2.8,
  makingFeePercent: 24,
  priceToman: 17_548_000,
  displayPriceToman: 17_548_000,
  compareAtPriceToman: null,
  discountPercent: null,
  discountStartsAt: null,
  discountEndsAt: null,
  imageUrl: '/images/home/new-arrival-lifestyle.png',
  hoverImageUrl: '/images/home/new-arrival-lifestyle.png',
  heroImageUrl: '/images/products/pdp-hero.png',
  inventory: 3,
  featured: true,
  description:
    '<p>انگشتر زنانه لوکس بیضی با طراحی مینیمال و درخشش بالا، مناسب استفاده روزمره و مهمانی‌های رسمی.</p>',
  seoDescription: 'انگشتر زنانه لوکس بیضی — طلای ۱۸ عیار',
  specifications: {},
  variants: DEMO_VARIANTS,
  gallery: [
    '/images/products/pdp-hero.png',
    '/images/products/pdp-hero.png',
    '/images/products/pdp-hero.png',
    '/images/products/pdp-hero.png',
    '/images/products/pdp-hero.png',
  ],
  ringSizes: [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63],
  goldColors: ['طلایی', 'رزگلد', 'سفید'],
  stoneSwatches: DEMO_STONE_SWATCHES,
  specRows: DEMO_SPEC_ROWS,
  featuredReview: {
    id: 'featured-review',
    author: 'نام و نام خانوادگی کاربر',
    rating: 5,
    date: '',
    body: 'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است.',
  },
  relatedProducts: DEFAULT_RELATED_PRODUCTS,
  ratingAverage: 5,
  reviewCount: 1,
  reviews: DEMO_PRODUCT_REVIEWS,
  videos: DEMO_PRODUCT_VIDEOS,
};

const JEWELRY_SET_IMAGE = '/images/products/jewelry-set-lifestyle.png';

const JEWELRY_SET_SPEC_ROWS: ProductSpecRow[] = [
  { label: 'اجرت', value: '۲۲٪' },
  { label: 'نوع طراحی', value: 'مایع / ارگانیک' },
  { label: 'قطعات ست', value: 'انگشتر، دستبند، گوشواره' },
  { label: 'نوع پرداخت', value: 'براق' },
  { label: 'نوع قفل دستبند', value: 'باز' },
  { label: 'مالیات', value: '۵۲۵,۰۰۰ تومان' },
];

export const JEWELRY_SET_DEMO: ProductDetailDemo = {
  id: 'demo-jewelry-set-1',
  sku: 'DEMO-SET-LIQ',
  slug: 'demo-jewelry-set',
  title: 'ست زیورآلات طلای مایع',
  category: 'bracelet',
  karat: 18,
  weightGram: 12.4,
  makingFeePercent: 22,
  priceToman: 24_850_000,
  displayPriceToman: 24_850_000,
  compareAtPriceToman: null,
  discountPercent: null,
  discountStartsAt: null,
  discountEndsAt: null,
  imageUrl: JEWELRY_SET_IMAGE,
  hoverImageUrl: JEWELRY_SET_IMAGE,
  heroImageUrl: JEWELRY_SET_IMAGE,
  inventory: 5,
  featured: true,
  description:
    '<p>ست زیورآلات طلای مایع با طراحی ارگانیک و فرم قطره‌ای؛ شامل انگشتر، دستبند و گوشواره با پرداخت براق و استایل مینیمال لوکس.</p>',
  seoDescription: 'ست زیورآلات طلای مایع ۱۸ عیار — انگشتر، دستبند و گوشواره',
  specifications: {},
  variants: [
    {
      id: 'variant-jewelry-set-gold',
      sku: 'SET-LIQ-18-G',
      color: 'طلایی',
      size: '45',
      priceToman: 24_850_000,
      weightGram: 12.4,
      makingFeePercent: 22,
      imageUrl: JEWELRY_SET_IMAGE,
      quantity: 5,
      isDefault: true,
    },
  ],
  gallery: [
    JEWELRY_SET_IMAGE,
    JEWELRY_SET_IMAGE,
    JEWELRY_SET_IMAGE,
    JEWELRY_SET_IMAGE,
    JEWELRY_SET_IMAGE,
  ],
  ringSizes: [50, 51, 52, 53, 54, 55, 56, 57, 58],
  necklaceSizes: [40, 42, 45, 48, 50, 55],
  braceletSizes: [16, 17, 18, 19, 20, 21],
  goldColors: ['طلایی', 'رزگلد', 'سفید'],
  stoneSwatches: DEMO_STONE_SWATCHES,
  specRows: JEWELRY_SET_SPEC_ROWS,
  featuredReview: {
    id: 'jewelry-set-featured-review',
    author: 'سارا محمدی',
    rating: 5,
    date: '',
    body: 'کیفیت ساخت و درخشش طلا فوق‌العاده است. فرم مایع دستبند و انگشتر خیلی شیک و راحت است.',
  },
  relatedProducts: DEFAULT_RELATED_PRODUCTS,
  ratingAverage: 5,
  reviewCount: 3,
  reviews: DEMO_PRODUCT_REVIEWS,
  videos: DEMO_PRODUCT_VIDEOS,
};

export function resolveProductDetailDemo(slug: string): ProductDetailDemo | null {
  if (slug === JEWELRY_SET_DEMO.slug) {
    return JEWELRY_SET_DEMO;
  }
  if (slug === PRODUCT_DETAIL_DEMO.slug) {
    return PRODUCT_DETAIL_DEMO;
  }

  const listingProduct = PRODUCT_LISTING_DEMO_PRODUCTS.find((product) => product.slug === slug);
  if (listingProduct) {
    return buildListingDetailDemo(listingProduct);
  }

  return null;
}

const DEFAULT_RING_SIZES = [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63];
const DEFAULT_NECKLACE_SIZES = [40, 42, 45, 48, 50, 55];
const DEFAULT_BRACELET_SIZES = [16, 17, 18, 19, 20, 21];

function buildSetSpecRows(setPartsLabel: string): ProductSpecRow[] {
  return [
    { label: 'اجرت', value: '۲۲٪' },
    { label: 'نوع طراحی', value: 'مایع / ارگانیک' },
    { label: 'قطعات ست', value: setPartsLabel },
    { label: 'نوع پرداخت', value: 'براق' },
    { label: 'نوع قفل دستبند', value: 'باز' },
    { label: 'مالیات', value: '۵۲۵,۰۰۰ تومان' },
  ];
}

function buildListingDetailDemo(source: ProductSummary): ProductDetailDemo {
  const catalog = findCatalogDemoProduct(source.slug);
  const sizeKinds = resolveProductJewelrySizeKinds({
    title: source.title,
    slug: source.slug,
    category: source.category,
    description: catalog?.description ?? '',
    specifications: {},
  });
  const isSet = sizeKinds.length > 1;
  const template = isSet ? JEWELRY_SET_DEMO : PRODUCT_DETAIL_DEMO;
  const description = catalog?.description
    ? `<p>${catalog.description}</p>`
    : `<p>${source.title} — نمایش دمو فروشگاه طلاشیم.</p>`;

  return {
    ...template,
    id: source.id,
    sku: source.sku,
    slug: source.slug,
    title: source.title,
    category: source.category as ProductCategory,
    karat: source.karat,
    weightGram: source.weightGram,
    makingFeePercent: source.makingFeePercent,
    priceToman: source.priceToman,
    displayPriceToman: source.priceToman,
    compareAtPriceToman: source.compareAtPriceToman ?? null,
    discountPercent: source.discountPercent ?? null,
    discountStartsAt: source.discountStartsAt ?? null,
    discountEndsAt: source.discountEndsAt ?? null,
    imageUrl: source.imageUrl,
    hoverImageUrl: source.hoverImageUrl,
    heroImageUrl: source.imageUrl,
    inventory: source.inventory,
    featured: source.featured ?? false,
    description,
    seoDescription: catalog?.seoDescription ?? source.title,
    gallery: template.gallery.map((image, index) => (index === 0 ? source.imageUrl : image)),
    ringSizes: DEFAULT_RING_SIZES,
    necklaceSizes: sizeKinds.includes('necklace') ? DEFAULT_NECKLACE_SIZES : undefined,
    braceletSizes: sizeKinds.includes('bracelet') ? DEFAULT_BRACELET_SIZES : undefined,
    specRows:
      isSet && catalog?.setPartsLabel
        ? buildSetSpecRows(catalog.setPartsLabel)
        : isSet
          ? JEWELRY_SET_SPEC_ROWS
          : DEMO_SPEC_ROWS,
    relatedProducts: DEFAULT_RELATED_PRODUCTS,
    featuredReview: template.featuredReview,
    goldColors: template.goldColors,
    stoneSwatches: template.stoneSwatches,
    ratingAverage: template.ratingAverage,
    reviewCount: template.reviewCount,
    reviews: template.reviews,
    variants: template.variants,
    specifications: template.specifications,
    videos: template.videos,
  };
}

export interface ProductDetailMobileProps {
  product: ProductDetails;
  gallery?: string[];
  heroImageUrl?: string;
  displayPriceToman?: number;
  ringSizes?: number[];
  necklaceSizes?: number[];
  braceletSizes?: number[];
  goldColors?: string[];
  stoneSwatches?: StoneColorSwatch[];
  specRows?: ProductSpecRow[];
  featuredReview?: ProductReviewDemo;
  relatedProducts?: HomeProductCarouselItem[];
  videos?: ProductVideo[];
  reviews?: ProductReviewDemo[];
}

export function enrichProductDetailProps(
  product: ProductDetails,
  demo: ProductDetailDemo | null,
): ProductDetailMobileProps {
  const gallery =
    demo?.gallery ??
    (product.galleryUrls?.length ? product.galleryUrls : [product.imageUrl]);
  const videos = demo?.videos ?? product.videos ?? [];
  const reviews = demo?.reviews ?? [];

  if (!demo) {
    const catalog = findCatalogDemoProduct(product.slug);
    const sizeKinds = resolveProductJewelrySizeKinds({
      title: product.title,
      slug: product.slug,
      category: product.category,
      description: product.description,
      specifications: product.specifications,
    });
    const isSet = sizeKinds.length > 1;
    const pdpSections = resolvePdpSections(product);
    const hasPdpConfig = Boolean(product.pdpConfig);

    return {
      product,
      gallery,
      heroImageUrl: gallery[0] ?? product.imageUrl,
      videos,
      reviews,
      featuredReview: DEFAULT_FEATURED_REVIEW,
      relatedProducts: DEFAULT_RELATED_PRODUCTS,
      ringSizes: pdpSections.ringSizes,
      necklaceSizes: pdpSections.necklaceSizes,
      braceletSizes: pdpSections.braceletSizes,
      goldColors: pdpSections.goldColors ?? (catalog && !hasPdpConfig ? PRODUCT_DETAIL_DEMO.goldColors : undefined),
      stoneSwatches:
        pdpSections.stoneSwatches ??
        (catalog && !hasPdpConfig ? DEMO_STONE_SWATCHES : undefined),
      specRows:
        pdpSections.specRows ??
        (catalog && isSet && catalog.setPartsLabel
          ? buildSetSpecRows(catalog.setPartsLabel)
          : catalog && !hasPdpConfig
            ? DEMO_SPEC_ROWS
            : undefined),
    };
  }

  return {
    product,
    gallery,
    heroImageUrl: demo.heroImageUrl,
    displayPriceToman: demo.displayPriceToman,
    ringSizes: demo.ringSizes,
    necklaceSizes: demo.necklaceSizes,
    braceletSizes: demo.braceletSizes,
    goldColors: demo.goldColors,
    stoneSwatches: demo.stoneSwatches,
    specRows: demo.specRows,
    featuredReview: demo.featuredReview,
    relatedProducts: demo.relatedProducts,
    videos,
    reviews,
  };
}

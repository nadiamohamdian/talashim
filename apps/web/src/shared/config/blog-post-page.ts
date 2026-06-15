import type { ProductSummary } from '@sadafgold/types';
import { DEFAULT_FEATURED_REVIEW } from '@/shared/config/product-detail-demo';
import { HOME_MAGAZINE_COVER_IMAGE } from '@/shared/config/home-magazine-demo';

export interface BlogPostRelatedProductItem {
  id: string;
  slug: string;
  title: string;
  imageUrl: string;
  priceToman: number;
  weightGram: number;
}

export const BLOG_POST_SECTION_TITLES = {
  reviews: 'نظرات کاربران',
  relatedArticles: 'مقالات مرتبط',
  relatedProducts: 'محصولات مرتبط',
} as const;

export const BLOG_POST_DEMO_TITLE = 'چگونه از جواهرات خود نگهداری کنیم؟';

export const BLOG_POST_DEMO_BODY =
  'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون گرافیک است، چاپگرها و متون بلکه روزنامه گرافیک است، چاپگرها و متون بلکه روزنامه سوم متن ساختگی با تولید سادگ لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون گرافیک است، چاپگرها و متون بلکه روزنامه گرافیک است، چاپگرها و متون بلکه روزنامه سوم متن ساختگی با تولید سادگلورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون گرافیک است، چاپگرها و متون بلکه روزنامه گرافیک است، چاپگرها و متون بلکه روزنامه سوم متن ساختگی با تولید سادگ';

export const BLOG_POST_DEMO_BODY_SECOND =
  'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون گرافیک است، چاپگرها و متون بلکه روزنامه گرافیک است، چاپگرها و متون بلکه روزنامه سوم متن ساختگی با تولید سادگ لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت';

export const BLOG_POST_FEATURED_REVIEW = {
  ...DEFAULT_FEATURED_REVIEW,
  body:
    'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون گرافیک است، چاپگرها و متون بلکه روزنامه گرافیک است، چاپگرها و متون بلکه روزنامه سوم متن ساختگی با تولید سادگ',
};

export const BLOG_POST_FALLBACK_COVER = HOME_MAGAZINE_COVER_IMAGE;

export const BLOG_POST_RELATED_PRODUCT_IMAGE =
  '/images/products/964bdc1347006a50cdc0ea4b2ec46ea4-removebg-preview%201.png';

export const BLOG_POST_DEMO_RELATED_PRODUCTS: BlogPostRelatedProductItem[] = [
  {
    id: 'blog-related-product-1',
    slug: 'luxury-oval-womens-ring',
    title: 'انگشتر زنانه لوکس بیضی',
    imageUrl: BLOG_POST_RELATED_PRODUCT_IMAGE,
    priceToman: 8_500_000,
    weightGram: 2.8,
  },
  {
    id: 'blog-related-product-2',
    slug: 'luxury-oval-womens-ring-2',
    title: 'انگشتر زنانه لوکس بیضی',
    imageUrl: BLOG_POST_RELATED_PRODUCT_IMAGE,
    priceToman: 8_500_000,
    weightGram: 2.8,
  },
  {
    id: 'blog-related-product-3',
    slug: 'luxury-oval-womens-ring-3',
    title: 'انگشتر زنانه لوکس بیضی',
    imageUrl: BLOG_POST_RELATED_PRODUCT_IMAGE,
    priceToman: 8_500_000,
    weightGram: 2.8,
  },
];

export function mapProductToBlogRelatedItem(product: ProductSummary): BlogPostRelatedProductItem {
  const imageUrl = product.imageUrl?.trim() || BLOG_POST_RELATED_PRODUCT_IMAGE;

  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    imageUrl: imageUrl.startsWith('http') ? BLOG_POST_RELATED_PRODUCT_IMAGE : imageUrl,
    priceToman: product.priceToman,
    weightGram: product.weightGram,
  };
}

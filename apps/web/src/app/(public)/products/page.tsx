import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import { getProducts, getSaleProducts } from '@/shared/api/catalog-api';
import {
  PRODUCT_LISTING_DEMO_PRODUCTS,
  PRODUCT_LISTING_PAGE,
} from '@/shared/config/product-listing-demo';
import { ProductListingView } from '@/widgets/catalog/product-listing-view';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ sale?: string }>;
}): Promise<Metadata> {
  const { sale } = await searchParams;
  const onSale = sale === '1';

  return {
    title: onSale ? 'تخفیف‌های روز' : PRODUCT_LISTING_PAGE.title,
    description: onSale
      ? 'محصولات طلا و جواهر با تخفیف فعال'
      : PRODUCT_LISTING_PAGE.subtitle,
  };
}

interface ProductsPageProps {
  searchParams: Promise<{ sale?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { sale } = await searchParams;
  const onSale = sale === '1';

  if (onSale) {
    noStore();
  }

  let products: Awaited<ReturnType<typeof getProducts>> = [];
  try {
    products = onSale ? await getSaleProducts(48) : await getProducts(24, undefined, false);
  } catch {
    products = [];
  }

  const displayProducts =
    products.length > 0 ? products : PRODUCT_LISTING_DEMO_PRODUCTS;

  return (
    <ProductListingView
      products={displayProducts}
      meta={
        onSale
          ? {
              title: 'تخفیف‌های روز',
              subtitle: 'محصولات طلا و جواهر با تخفیف فعال',
            }
          : PRODUCT_LISTING_PAGE
      }
    />
  );
}

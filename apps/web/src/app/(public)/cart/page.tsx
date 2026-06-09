import type { Metadata } from 'next';
import { getFeaturedProducts, getProducts } from '@/shared/api/catalog-api';
import { PRODUCT_LISTING_DEMO_PRODUCTS } from '@/shared/config/product-listing-demo';
import { CartPageView } from '@/widgets/cart/cart-page-view';

export const metadata: Metadata = {
  title: 'سبد خرید',
  description: 'مشاهده و ویرایش سبد خرید',
};

export default async function CartPage() {
  let similarProducts: Awaited<ReturnType<typeof getFeaturedProducts>> = [];

  try {
    similarProducts = await getFeaturedProducts();
  } catch {
    similarProducts = [];
  }

  if (similarProducts.length === 0) {
    try {
      const products = await getProducts(6);
      similarProducts = products.length > 0 ? products : PRODUCT_LISTING_DEMO_PRODUCTS.slice(0, 6);
    } catch {
      similarProducts = PRODUCT_LISTING_DEMO_PRODUCTS.slice(0, 6);
    }
  } else {
    similarProducts = similarProducts.slice(0, 6);
  }

  return <CartPageView similarProducts={similarProducts} />;
}

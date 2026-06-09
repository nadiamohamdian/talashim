import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import { getProducts, getSaleProducts } from '@/shared/api/catalog-api';
import {
  PRODUCT_LISTING_DEMO_PRODUCTS,
  PRODUCT_LISTING_PAGE,
} from '@/shared/config/product-listing-demo';
import {
  filterProductsByCategory,
  getCategoryListingMeta,
  resolveCatalogCategorySlug,
} from '@/shared/lib/catalog-category';
import {
  filterProductsByPrice,
  getBudgetListingMeta,
  hasProductPriceFilter,
  parseProductPriceFilter,
} from '@/shared/lib/product-price-filter';
import { ProductListingView } from '@/widgets/catalog/product-listing-view';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{
    sale?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const { sale } = params;
  const onSale = sale === '1';
  const priceFilter = parseProductPriceFilter(params);
  const categorySlug = resolveCatalogCategorySlug(params.category);
  const budgetMeta = getBudgetListingMeta(priceFilter);
  const categoryMeta = categorySlug ? getCategoryListingMeta(params.category ?? categorySlug) : null;

  if (onSale) {
    return {
      title: 'تخفیف‌های روز',
      description: 'محصولات طلا و جواهر با تخفیف فعال',
    };
  }

  if (budgetMeta) {
    return {
      title: budgetMeta.title,
      description: budgetMeta.subtitle ?? 'محصولات در بازه بودجه انتخاب‌شده',
    };
  }

  if (categoryMeta) {
    return {
      title: categoryMeta.title,
      description: categoryMeta.subtitle ?? `محصولات ${categoryMeta.title}`,
    };
  }

  return {
    title: PRODUCT_LISTING_PAGE.title,
    description: 'خرید طلا و جواهر با ضمانت اصالت و ارسال سریع',
  };
}

interface ProductsPageProps {
  searchParams: Promise<{
    sale?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

function buildDemoProducts(categorySlug: string | undefined, priceFilter: ReturnType<typeof parseProductPriceFilter>) {
  let products = PRODUCT_LISTING_DEMO_PRODUCTS;
  if (categorySlug) {
    products = filterProductsByCategory(products, categorySlug);
  }
  return filterProductsByPrice(products, priceFilter);
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const { sale, category } = params;
  const onSale = sale === '1';
  const priceFilter = parseProductPriceFilter(params);
  const hasPriceFilter = hasProductPriceFilter(priceFilter);
  const categorySlug = resolveCatalogCategorySlug(category);

  if (onSale || hasPriceFilter || categorySlug) {
    noStore();
  }

  let products: Awaited<ReturnType<typeof getProducts>> = [];
  try {
    if (onSale) {
      products = await getSaleProducts(48);
    } else {
      products = await getProducts(48, categorySlug, false, priceFilter);
    }
  } catch {
    products = [];
  }

  if (categorySlug) {
    products = filterProductsByCategory(products, categorySlug);
  }
  if (hasPriceFilter) {
    products = filterProductsByPrice(products, priceFilter);
  }

  const demoProducts = buildDemoProducts(categorySlug, priceFilter);
  const displayProducts = products.length > 0 ? products : demoProducts;
  const budgetMeta = getBudgetListingMeta(priceFilter);
  const categoryMeta = categorySlug ? getCategoryListingMeta(category ?? categorySlug) : null;

  let emptyMessage = 'محصولی یافت نشد.';
  if (hasPriceFilter && categorySlug) {
    emptyMessage = 'محصولی در این دسته و بازه قیمت یافت نشد.';
  } else if (hasPriceFilter) {
    emptyMessage = 'محصولی در این بازه قیمت یافت نشد.';
  } else if (categorySlug) {
    emptyMessage = 'محصولی در این دسته یافت نشد.';
  }

  return (
    <ProductListingView
      products={displayProducts}
      meta={
        onSale
          ? {
              title: 'تخفیف‌های روز',
              subtitle: 'محصولات طلا و جواهر با تخفیف فعال',
            }
          : budgetMeta ?? categoryMeta ?? PRODUCT_LISTING_PAGE
      }
      showDefaultHero={!hasPriceFilter && !onSale && !categorySlug}
      emptyMessage={emptyMessage}
    />
  );
}

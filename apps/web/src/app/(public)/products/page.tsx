import type { Metadata } from 'next';
import { Suspense } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import { buildDefaultCatalogCategoryFilterConfig } from '@sadafgold/shared';
import type { PaginatedResponse, ProductSummary, PublicCatalogCategoryPage } from '@sadafgold/types';
import {
  getCatalogCategoryPage,
  getProductsPaginated,
  getSaleProducts,
} from '@/shared/api/catalog-api';
import {
  PRODUCT_LISTING_DEMO_PRODUCTS,
  PRODUCT_LISTING_PAGE,
} from '@/shared/config/product-listing-demo';
import { getCategoryListingGallerySlides } from '@/shared/config/category-listing-gallery';
import { resolveCategoryListingGallerySlides } from '@/shared/config/cms-category-listing-gallery';
import { getPublicHomepage } from '@/lib/api/cms.api';
import {
  filterProductsByCategory,
  getCategoryListingMeta,
  resolveCatalogCategorySlug,
} from '@/shared/lib/catalog-category';
import {
  filterProductsBySearchTerms,
  filterProductsByWeight,
  getEffectivePriceFilter,
  hasActiveListingQuery,
  parseProductListingQuery,
} from '@/shared/lib/product-listing-query';
import {
  filterProductsByPrice,
  getBudgetListingMeta,
  hasProductPriceFilter,
  parseProductPriceFilter,
} from '@/shared/lib/product-price-filter';
import { ProductListingPageClient } from '@/widgets/catalog/product-listing-page-client';

const PAGE_SIZE = 9;

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
  const categoryPage = categorySlug
    ? await getCatalogCategoryPage(params.category ?? categorySlug)
    : null;
  const categoryMeta = categoryPage
    ? { title: categoryPage.title, subtitle: categoryPage.subtitle ?? undefined }
    : categorySlug
      ? getCategoryListingMeta(params.category ?? categorySlug)
      : null;

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
      title: categoryPage?.seoTitle ?? categoryMeta.title,
      description:
        categoryPage?.seoDescription ??
        categoryMeta.subtitle ??
        `محصولات ${categoryMeta.title}`,
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
    minWeight?: string;
    maxWeight?: string;
    sort?: string;
    filters?: string;
    page?: string;
  }>;
}

function buildDemoProducts(
  categorySlug: string | undefined,
  priceFilter: ReturnType<typeof parseProductPriceFilter>,
) {
  let products = PRODUCT_LISTING_DEMO_PRODUCTS;
  if (categorySlug) {
    products = filterProductsByCategory(products, categorySlug);
  }
  return filterProductsByPrice(products, priceFilter);
}

async function ProductsPageContent({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const listingQuery = parseProductListingQuery(new URLSearchParams(params as Record<string, string>));
  const { sale, category } = params;
  const onSale = sale === '1';
  const priceFilter = parseProductPriceFilter(params);
  const effectivePriceFilter = getEffectivePriceFilter(listingQuery, priceFilter);
  const hasPriceFilter = hasProductPriceFilter(effectivePriceFilter);
  const hasActiveFilters = hasActiveListingQuery(listingQuery, priceFilter);
  const categorySlug = resolveCatalogCategorySlug(category);
  const categoryPage: PublicCatalogCategoryPage | null = categorySlug
    ? (await getCatalogCategoryPage(category ?? categorySlug)) ??
      ({
        slug: category ?? categorySlug,
        title: getCategoryListingMeta(category ?? categorySlug)?.title ?? category ?? '',
        subtitle: getCategoryListingMeta(category ?? categorySlug)?.subtitle ?? null,
        heroImageUrls: [],
        filterConfig: buildDefaultCatalogCategoryFilterConfig(category ?? categorySlug),
        productCategory: categorySlug,
        seoTitle: null,
        seoDescription: null,
      } satisfies PublicCatalogCategoryPage)
    : null;

  if (onSale || categorySlug || hasActiveFilters) {
    noStore();
  }

  let pagination: PaginatedResponse<ProductSummary> | null = null;
  let products: ProductSummary[] = [];
  let catalogFetchFailed = false;

  try {
    if (onSale) {
      products = await getSaleProducts(48);
    } else {
      pagination = await getProductsPaginated({
        page: listingQuery.page,
        limit: PAGE_SIZE,
        category: category ?? categorySlug,
        minPrice: effectivePriceFilter.minPrice,
        maxPrice: effectivePriceFilter.maxPrice,
        minWeight: listingQuery.minWeight,
        maxWeight: listingQuery.maxWeight,
        sort: listingQuery.sort ?? undefined,
      });
      products = pagination.items;
    }
  } catch {
    catalogFetchFailed = true;
    products = [];
  }

  if (!catalogFetchFailed && categorySlug) {
    products = filterProductsByCategory(products, categorySlug);
  }

  if (!catalogFetchFailed) {
    products = filterProductsByPrice(products, effectivePriceFilter);
    products = filterProductsByWeight(
      products,
      listingQuery.minWeight,
      listingQuery.maxWeight,
    );

    if (categoryPage?.filterConfig) {
      products = filterProductsBySearchTerms(
        products,
        categoryPage.filterConfig,
        listingQuery.filterIds,
      );
    }
  }

  const demoProducts = buildDemoProducts(categorySlug, effectivePriceFilter);
  let displayProducts = products;

  if (displayProducts.length === 0 && !hasActiveFilters && !onSale) {
    displayProducts = filterProductsByWeight(
      filterProductsBySearchTerms(
        demoProducts,
        categoryPage?.filterConfig,
        listingQuery.filterIds,
      ),
      listingQuery.minWeight,
      listingQuery.maxWeight,
    );
  }
  const budgetMeta = getBudgetListingMeta(priceFilter);

  const categoryMeta = categoryPage
    ? {
        title: categoryPage.title,
        subtitle: categoryPage.subtitle ?? undefined,
      }
    : categorySlug
      ? getCategoryListingMeta(category ?? categorySlug)
      : null;

  let categoryGallerySlides: readonly string[] | undefined;
  if (categoryPage?.heroImageUrls.length) {
    categoryGallerySlides = categoryPage.heroImageUrls;
  } else if (categorySlug) {
    try {
      const homepage = await getPublicHomepage();
      categoryGallerySlides = resolveCategoryListingGallerySlides(
        category ?? categorySlug,
        homepage.sections,
      );
    } catch {
      categoryGallerySlides = getCategoryListingGallerySlides(category ?? categorySlug);
    }
  }

  let emptyMessage = 'محصولی یافت نشد.';
  if (catalogFetchFailed) {
    emptyMessage = 'بارگذاری محصولات ناموفق بود. لطفاً دوباره تلاش کنید.';
  } else if (listingQuery.sort === 'discounts') {
    emptyMessage = 'محصولی با تخفیف فعال یافت نشد.';
  } else if (hasPriceFilter && categorySlug) {
    emptyMessage = 'محصولی در این دسته و بازه قیمت یافت نشد.';
  } else if (hasPriceFilter) {
    emptyMessage = 'محصولی در این بازه قیمت یافت نشد.';
  } else if (categorySlug) {
    emptyMessage = 'محصولی در این دسته یافت نشد.';
  }

  return (
    <ProductListingPageClient
      products={displayProducts}
      meta={
        onSale
          ? {
              title: 'تخفیف‌های روز',
              subtitle: 'محصولات طلا و جواهر با تخفیف فعال',
            }
          : budgetMeta ?? categoryMeta ?? PRODUCT_LISTING_PAGE
      }
      categoryPage={categoryPage}
      gallerySlides={categoryGallerySlides}
      showDefaultHero={!hasPriceFilter && !onSale && !categorySlug}
      emptyMessage={emptyMessage}
      pagination={pagination}
      pageSize={PAGE_SIZE}
    />
  );
}

export default function ProductsPage(props: ProductsPageProps) {
  return (
    <Suspense fallback={null}>
      <ProductsPageContent {...props} />
    </Suspense>
  );
}

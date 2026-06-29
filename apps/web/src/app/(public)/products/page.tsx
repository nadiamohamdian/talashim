import type { Metadata } from 'next';
import { Suspense } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import { buildDefaultCatalogCategoryFilterConfig } from '@sadafgold/shared';
import {
  isVirtualCatalogCategory,
  resolveCatalogApiCategoryQuery,
} from '@sadafgold/shared';
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
import { GIFT_LISTING_PAGE } from '@/shared/config/storefront-ia';
import { getCategoryListingGallerySlides } from '@/shared/config/category-listing-gallery';
import { resolveCategoryListingGallerySlides } from '@/shared/config/cms-category-listing-gallery';
import { getPublicHomepage } from '@/lib/api/cms.api';
import {
  filterProductsByCategory,
  getCategoryListingMeta,
  resolveCatalogCategorySlug,
} from '@/shared/lib/catalog-category';
import {
  applyProductListingQueryToProducts,
  filterProductsBySearchTerms,
  filterProductsByWeight,
  getEffectivePriceFilter,
  hasActiveListingQuery,
  parseProductListingQuery,
  resolveProductListingFilterConfig,
  sortProductsByListingQuery,
} from '@/shared/lib/product-listing-query';
import {
  buildGiftListingFilterConfig,
  filterProductsByGift,
  filterProductsByProductType,
  isKidsListingCategory,
  parseProductListingType,
} from '@/shared/lib/product-listing-scope';
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
    type?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const { sale, type } = params;
  const onSale = sale === '1';
  const productType = parseProductListingType(type);
  const isGiftListing = productType === 'gold_jewelry' && !params.category;
  const priceFilter = parseProductPriceFilter(params);
  const categorySlug = resolveCatalogCategorySlug(params.category);
  const budgetMeta = getBudgetListingMeta(priceFilter, isGiftListing ? 'gift' : 'home');
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

  if (isGiftListing) {
    return {
      title: GIFT_LISTING_PAGE.title,
      description: GIFT_LISTING_PAGE.subtitle,
    };
  }

  if (isKidsListingCategory(params.category)) {
    const kidsMeta = getCategoryListingMeta('kids');
    return {
      title: kidsMeta?.title ?? 'طلای کودکانه',
      description: kidsMeta?.subtitle ?? 'محصولات طلای کودکانه',
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
    type?: string;
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
  productType?: ReturnType<typeof parseProductListingType>,
  giftOnly = false,
) {
  let products = PRODUCT_LISTING_DEMO_PRODUCTS;
  if (productType) {
    products = filterProductsByProductType(products, productType);
  }
  if (giftOnly) {
    products = filterProductsByGift(products);
  }
  if (categorySlug) {
    products = filterProductsByCategory(products, categorySlug);
  }
  return filterProductsByPrice(products, priceFilter);
}

async function ProductsPageContent({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const listingQuery = parseProductListingQuery(new URLSearchParams(params as Record<string, string>));
  const { sale, category, type } = params;
  const onSale = sale === '1';
  const productType = parseProductListingType(type);
  const isGiftListing = productType === 'gold_jewelry' && !category;
  const priceFilter = parseProductPriceFilter(params);
  const effectivePriceFilter = getEffectivePriceFilter(listingQuery, priceFilter);
  const hasPriceFilter = hasProductPriceFilter(effectivePriceFilter);
  const hasActiveFilters = hasActiveListingQuery(listingQuery, priceFilter);
  const categorySlug = resolveCatalogCategorySlug(category);
  const isKidsCategory = isKidsListingCategory(category);
  let categoryPage: PublicCatalogCategoryPage | null = null;
  if (categorySlug || isKidsCategory) {
    const slug = category ?? (isKidsCategory ? 'kids' : categorySlug);
    const fetched = slug ? await getCatalogCategoryPage(slug) : null;
    categoryPage = fetched
      ? {
          ...fetched,
          heroImageUrls: fetched.heroImageUrls ?? [],
          filterConfig:
            fetched.filterConfig ?? buildDefaultCatalogCategoryFilterConfig(slug ?? 'rings'),
        }
      : slug
        ? {
            slug,
            title: getCategoryListingMeta(slug)?.title ?? category ?? '',
            subtitle: getCategoryListingMeta(slug)?.subtitle ?? null,
            heroImageUrls: [],
            filterConfig: buildDefaultCatalogCategoryFilterConfig(slug),
            productCategory: isKidsCategory ? null : categorySlug ?? null,
            seoTitle: null,
            seoDescription: null,
          }
        : null;
  }
  const listingCategoryKey =
    categorySlug ?? (isKidsCategory ? 'kids' : undefined);
  const needsBroadCategoryFetch = listingCategoryKey
    ? isVirtualCatalogCategory(listingCategoryKey)
    : false;
  const apiCategoryQuery = resolveCatalogApiCategoryQuery(
    category ?? categoryPage?.slug,
    categoryPage?.productCategory,
  );
  const listingFilterConfig = isGiftListing
    ? buildGiftListingFilterConfig()
    : resolveProductListingFilterConfig(categoryPage, category ?? categorySlug);

  if (onSale || categorySlug || isKidsCategory || isGiftListing || hasActiveFilters) {
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
        page: needsBroadCategoryFetch ? 1 : listingQuery.page,
        limit: needsBroadCategoryFetch ? 120 : PAGE_SIZE,
        category: apiCategoryQuery,
        minPrice: effectivePriceFilter.minPrice,
        maxPrice: effectivePriceFilter.maxPrice,
        minWeight: listingQuery.minWeight,
        maxWeight: listingQuery.maxWeight,
        sort: listingQuery.sort ?? undefined,
      });
      products = pagination.items;

      if (needsBroadCategoryFetch && listingCategoryKey) {
        products = filterProductsByCategory(products, listingCategoryKey);
        if (pagination) {
          const page = listingQuery.page;
          const start = (page - 1) * PAGE_SIZE;
          pagination = {
            ...pagination,
            page,
            limit: PAGE_SIZE,
            total: products.length,
            items: products.slice(start, start + PAGE_SIZE),
          };
          products = pagination.items;
        }
      }
    }
  } catch {
    catalogFetchFailed = true;
    products = [];
  }

  if (!catalogFetchFailed && categorySlug && !needsBroadCategoryFetch) {
    products = filterProductsByCategory(products, categorySlug);
  }

  if (!catalogFetchFailed && isKidsCategory && !needsBroadCategoryFetch) {
    products = filterProductsByCategory(products, 'kids');
  }

  if (!catalogFetchFailed && productType) {
    products = filterProductsByProductType(products, productType);
  }

  if (!catalogFetchFailed && isGiftListing) {
    products = filterProductsByGift(products);
  }

  if (!catalogFetchFailed) {
    products = filterProductsByPrice(products, effectivePriceFilter);
    products = filterProductsByWeight(
      products,
      listingQuery.minWeight,
      listingQuery.maxWeight,
    );

    products = filterProductsBySearchTerms(
      products,
      listingFilterConfig,
      listingQuery.filterIds,
    );

    products = sortProductsByListingQuery(products, listingQuery.sort, listingFilterConfig);
  }

  const demoProducts = buildDemoProducts(
    isKidsCategory ? 'kids' : categorySlug,
    effectivePriceFilter,
    productType,
    isGiftListing,
  );
  let displayProducts = products;

  if (
    displayProducts.length === 0 &&
    !onSale &&
    !catalogFetchFailed &&
    !categorySlug &&
    !isKidsCategory &&
    !isGiftListing
  ) {
    displayProducts = applyProductListingQueryToProducts(
      demoProducts,
      listingQuery,
      listingFilterConfig,
      priceFilter,
    );
  }
  const budgetMeta = getBudgetListingMeta(priceFilter, isGiftListing ? 'gift' : 'home');

  const categoryMeta = categoryPage
    ? {
        title: categoryPage.title,
        subtitle: categoryPage.subtitle ?? undefined,
      }
    : isKidsCategory
      ? getCategoryListingMeta('kids')
      : categorySlug
        ? getCategoryListingMeta(category ?? categorySlug)
        : null;

  let categoryGallerySlides: readonly string[] | undefined;
  if (categoryPage?.heroImageUrls?.length) {
    categoryGallerySlides = categoryPage.heroImageUrls;
  } else if (categorySlug || isKidsCategory) {
    try {
      const homepage = await getPublicHomepage();
      categoryGallerySlides = resolveCategoryListingGallerySlides(
        category ?? (isKidsCategory ? 'kids' : categorySlug) ?? 'rings',
        homepage.sections,
      );
    } catch {
      categoryGallerySlides = getCategoryListingGallerySlides(
        category ?? (isKidsCategory ? 'kids' : categorySlug) ?? 'rings',
      );
    }
  }

  let emptyMessage = 'محصولی یافت نشد.';
  if (catalogFetchFailed) {
    emptyMessage = 'بارگذاری محصولات ناموفق بود. لطفاً دوباره تلاش کنید.';
  } else if (listingQuery.sort === 'discounts') {
    emptyMessage = 'محصولی با تخفیف فعال یافت نشد.';
  } else if (hasPriceFilter && (categorySlug || isKidsCategory)) {
    emptyMessage = 'محصولی در این دسته و بازه قیمت یافت نشد.';
  } else if (hasPriceFilter && isGiftListing) {
    emptyMessage = 'طلای هدیه‌ای در این بازه بودجه یافت نشد.';
  } else if (hasPriceFilter) {
    emptyMessage = 'محصولی در این بازه قیمت یافت نشد.';
  } else if (isKidsCategory) {
    emptyMessage = 'محصول کودکانه‌ای یافت نشد.';
  } else if (isGiftListing) {
    emptyMessage = 'برای مشاهده پیشنهادها، بودجه هدیه خود را انتخاب کنید.';
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
          : budgetMeta ??
            (isGiftListing && !hasPriceFilter ? GIFT_LISTING_PAGE : null) ??
            categoryMeta ??
            PRODUCT_LISTING_PAGE
      }
      categoryPage={categoryPage}
      filterConfig={listingFilterConfig}
      categorySlug={category ?? (isKidsCategory ? 'kids' : categorySlug)}
      gallerySlides={categoryGallerySlides}
      showDefaultHero={!hasPriceFilter && !onSale && !categorySlug && !isKidsCategory && !isGiftListing}
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

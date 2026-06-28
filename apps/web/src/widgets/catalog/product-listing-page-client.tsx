'use client';

import { useCallback, useMemo, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { PaginatedResponse, ProductSummary, PublicCatalogCategoryPage } from '@sadafgold/types';
import type { CatalogCategoryFilterConfig } from '@sadafgold/types';
import type { ProductListingPageMeta } from '@/shared/config/product-listing-meta';
import {
  applyFilterSelection,
  applySortSelection,
  buildProductListingSearchParams,
  clearProductListingFilters,
  parseProductListingQuery,
  resolveProductListingFilterConfig,
} from '@/shared/lib/product-listing-query';
import { ProductListingView } from '@/widgets/catalog/product-listing-view';

interface ProductListingPageClientProps {
  products: ProductSummary[];
  meta: ProductListingPageMeta;
  categoryPage?: PublicCatalogCategoryPage | null;
  filterConfig?: CatalogCategoryFilterConfig;
  categorySlug?: string;
  gallerySlides?: readonly string[];
  showDefaultHero?: boolean;
  beforeTop?: React.ReactNode;
  emptyMessage?: string;
  pagination?: Pick<PaginatedResponse<ProductSummary>, 'page' | 'limit' | 'total'> | null;
  pageSize?: number;
}

export function ProductListingPageClient({
  products,
  meta,
  categoryPage,
  filterConfig,
  categorySlug,
  gallerySlides,
  showDefaultHero = true,
  beforeTop,
  emptyMessage,
  pagination,
  pageSize = 9,
}: ProductListingPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const queryState = useMemo(
    () => parseProductListingQuery(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const resolvedFilterConfig = useMemo(
    () => filterConfig ?? resolveProductListingFilterConfig(categoryPage, categorySlug),
    [categoryPage, categorySlug, filterConfig],
  );

  const pushQueryState = useCallback(
    (nextState: ReturnType<typeof parseProductListingQuery>) => {
      const nextParams = buildProductListingSearchParams(
        nextState,
        new URLSearchParams(searchParams.toString()),
      );
      const query = nextParams.toString();
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
        router.refresh();
      });
    },
    [pathname, router, searchParams],
  );

  const totalPages = pagination
    ? Math.max(1, Math.ceil(pagination.total / (pagination.limit || pageSize)))
    : 1;

  return (
    <ProductListingView
      products={products}
      meta={meta}
      categoryPage={categoryPage}
      filterConfig={resolvedFilterConfig}
      gallerySlides={gallerySlides}
      showDefaultHero={showDefaultHero}
      beforeTop={beforeTop}
      emptyMessage={emptyMessage}
      isLoading={isPending}
      queryState={queryState}
      currentPage={pagination?.page ?? queryState.page}
      totalPages={totalPages}
      onSortChange={(sortId) => pushQueryState(applySortSelection(queryState, sortId))}
      onToggleFilter={(optionId, checked) => {
        pushQueryState(
          applyFilterSelection(queryState, resolvedFilterConfig, optionId, checked),
        );
      }}
      onClearFilters={() => pushQueryState(clearProductListingFilters(queryState))}
      onPageChange={(page) => pushQueryState({ ...queryState, page })}
    />
  );
}

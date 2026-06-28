'use client';

import { useCallback, useState, type PropsWithChildren } from 'react';
import type { ProductSummary, PublicCatalogCategoryPage, CatalogCategoryFilterConfig } from '@sadafgold/types';
import {
  PRODUCT_LISTING_CAROUSEL_SLIDES,
  PRODUCT_LISTING_PAGE,
  type ProductListingPageMeta,
} from '@/shared/config/product-listing-meta';
import {
  resolveProductListingFilterConfig,
  type ProductListingQueryState,
} from '@/shared/lib/product-listing-query';
import { ProductListingCard } from '@/widgets/catalog/product-listing-card';
import { ProductListingFilterSheet } from '@/widgets/catalog/product-listing-filter-sheet';
import { ProductListingHeroCarousel } from '@/widgets/catalog/product-listing-hero-carousel';
import { ProductListingPagination } from '@/widgets/catalog/product-listing-pagination';
import { ProductListingSidebar } from '@/widgets/catalog/product-listing-sidebar';
import { ProductListingSortSheet } from '@/widgets/catalog/product-listing-sort-sheet';
import { ProductListingToolbar } from '@/widgets/catalog/product-listing-toolbar';

interface ProductListingViewProps extends PropsWithChildren {
  products: ProductSummary[];
  meta?: ProductListingPageMeta;
  categoryPage?: PublicCatalogCategoryPage | null;
  filterConfig?: CatalogCategoryFilterConfig;
  gallerySlides?: readonly string[];
  showDefaultHero?: boolean;
  beforeTop?: React.ReactNode;
  emptyMessage?: string;
  isLoading?: boolean;
  loadingMessage?: string;
  queryState?: ProductListingQueryState;
  currentPage?: number;
  totalPages?: number;
  onSortChange?: (sortId: string) => void;
  onToggleFilter?: (optionId: string, checked: boolean) => void;
  onClearFilters?: () => void;
  onPageChange?: (page: number) => void;
}

export function ProductListingView({
  products,
  meta = PRODUCT_LISTING_PAGE,
  categoryPage,
  filterConfig,
  children,
  gallerySlides,
  showDefaultHero = true,
  beforeTop,
  emptyMessage = 'محصولی یافت نشد.',
  isLoading = false,
  loadingMessage = 'در حال بارگذاری...',
  queryState,
  currentPage = 1,
  totalPages = 1,
  onSortChange,
  onToggleFilter,
  onClearFilters,
  onPageChange,
}: ProductListingViewProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const resolvedGallerySlides =
    gallerySlides ??
    (categoryPage?.heroImageUrls?.length ? categoryPage.heroImageUrls : undefined) ??
    (showDefaultHero ? PRODUCT_LISTING_CAROUSEL_SLIDES : undefined);

  const handleSortChange = useCallback(
    (sortId: string) => {
      onSortChange?.(sortId);
      setSortOpen(false);
    },
    [onSortChange],
  );

  const handleToggleFilter = useCallback(
    (optionId: string, checked: boolean) => {
      onToggleFilter?.(optionId, checked);
    },
    [onToggleFilter],
  );

  const handleClearFilters = useCallback(() => {
    onClearFilters?.();
    setFilterOpen(false);
  }, [onClearFilters]);

  const resolvedQueryState =
    queryState ??
    ({
      sort: null,
      filterIds: [],
      page: currentPage,
    } satisfies ProductListingQueryState);

  const resolvedFilterConfig =
    filterConfig ?? resolveProductListingFilterConfig(categoryPage);

  return (
    <div className="product-listing-page store-chrome-light store-minimal-header">
      {beforeTop}
      <div className="product-listing-top">
        <div className="product-listing-inner product-listing-inner--top">
          <div className="product-listing-top-layout">
            <header className="product-listing-header">
              <h1 className="product-listing-title">{meta.title}</h1>
              {meta.subtitle ? <p className="product-listing-subtitle">{meta.subtitle}</p> : null}
            </header>

            {children ??
              (resolvedGallerySlides && resolvedGallerySlides.length > 0 ? (
                <div className="product-listing-hero-band">
                  <ProductListingHeroCarousel slides={resolvedGallerySlides} />
                </div>
              ) : null)}
          </div>
        </div>
      </div>

      <div className="product-listing-inner product-listing-inner--body">
        <div className="product-listing-body">
          <ProductListingSidebar
            filterConfig={resolvedFilterConfig}
            queryState={resolvedQueryState}
            onSortChange={handleSortChange}
            onToggleFilter={handleToggleFilter}
            onClearFilters={handleClearFilters}
          />

          <div className="product-listing-main">
            <ProductListingToolbar
              onSortOpen={() => setSortOpen(true)}
              onFilterOpen={() => setFilterOpen(true)}
            />

            {isLoading ? (
              <p className="product-listing-empty">{loadingMessage}</p>
            ) : products.length === 0 ? (
              <p className="product-listing-empty">{emptyMessage}</p>
            ) : (
              <div className="product-listing-grid">
                {products.map((product) => (
                  <ProductListingCard key={product.id} product={product} />
                ))}
              </div>
            )}

            <ProductListingPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        </div>
      </div>

      <ProductListingSortSheet
        open={sortOpen}
        selected={resolvedQueryState.sort}
        sortOptions={resolvedFilterConfig?.sortOptions}
        onSelect={handleSortChange}
        onClose={() => setSortOpen(false)}
      />

      <ProductListingFilterSheet
        open={filterOpen}
        filterConfig={resolvedFilterConfig}
        queryState={resolvedQueryState}
        onToggleFilter={handleToggleFilter}
        onClearAll={handleClearFilters}
        onClose={() => setFilterOpen(false)}
      />
    </div>
  );
}

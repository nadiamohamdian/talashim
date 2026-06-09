'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import type { PaginatedResponse, ProductSummary } from '@sadafgold/types';
import { useProductSearch } from '@/lib/api/hooks/use-products';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';
import { ProductListingSearchField } from '@/widgets/catalog/product-listing-search-field';
import { ProductListingView } from '@/widgets/catalog/product-listing-view';

interface SearchResultsViewProps {
  initialQuery: string;
  initialCategory?: string;
  initialResults: PaginatedResponse<ProductSummary> | null;
}

function buildSearchMeta(query: string, total: number) {
  if (query.length < 2) {
    return {
      title: 'جستجو در محصولات',
      subtitle: 'حداقل ۲ کاراکتر برای جستجو وارد کنید',
    };
  }

  if (total === 0) {
    return {
      title: `«${query}»`,
      subtitle: 'محصولی یافت نشد',
    };
  }

  return {
    title: `«${query}»`,
    subtitle: `${toPersianDigits(total)} محصول یافت شد`,
  };
}

export function SearchResultsView({
  initialQuery,
  initialCategory = '',
  initialResults,
}: SearchResultsViewProps) {
  const searchParams = useSearchParams();
  const query = (searchParams.get('q') ?? initialQuery).trim();
  const category = searchParams.get('category') ?? initialCategory;

  const searchRequest = useMemo(
    () => ({
      query,
      page: 1,
      limit: 24,
      category: category || undefined,
    }),
    [query, category],
  );

  const useInitialResults =
    query === initialQuery.trim() &&
    (category || '') === (initialCategory || '') &&
    initialResults != null;

  const { data, isLoading, isFetching, isError } = useProductSearch(searchRequest, {
    initialData: useInitialResults ? initialResults : undefined,
  });

  const products = data?.items ?? [];
  const total = data?.total ?? 0;
  const meta = buildSearchMeta(query, total);
  const showLoading = query.length >= 2 && isLoading && !data;
  const showError = query.length >= 2 && isError && !data;

  let emptyMessage = 'برای جستجو حداقل ۲ کاراکتر وارد کنید.';
  if (query.length >= 2 && showError) {
    emptyMessage = 'جستجو ناموفق بود. دوباره تلاش کنید.';
  } else if (query.length >= 2 && !showLoading) {
    emptyMessage = 'محصولی یافت نشد.';
  }

  return (
    <ProductListingView
      products={showLoading ? [] : products}
      meta={meta}
      hero={<ProductListingSearchField defaultQuery={query} />}
      emptyMessage={emptyMessage}
      isLoading={showLoading || (isFetching && products.length === 0 && query.length >= 2)}
      loadingMessage="در حال جستجو..."
    />
  );
}

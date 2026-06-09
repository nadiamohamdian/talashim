import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import { Suspense } from 'react';
import type { PaginatedResponse, ProductSummary } from '@sadafgold/types';
import { searchProducts } from '@/shared/api/catalog-api';
import { SearchResultsView } from '@/widgets/catalog/search-results-view';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q = '' } = await searchParams;
  const query = q.trim();

  return {
    title: query.length >= 2 ? `جستجو: ${query}` : 'جستجو در محصولات',
    description: 'جستجو در کاتالوگ محصولات طلا و جواهر',
  };
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  noStore();

  const { q = '', category = '' } = await searchParams;
  const query = q.trim();

  let initialResults: PaginatedResponse<ProductSummary> | null = null;
  if (query.length >= 2) {
    try {
      initialResults = await searchProducts(query, 1, 24, category || undefined);
    } catch {
      initialResults = null;
    }
  }

  return (
    <Suspense fallback={null}>
      <SearchResultsView
        initialQuery={query}
        initialCategory={category}
        initialResults={initialResults}
      />
    </Suspense>
  );
}

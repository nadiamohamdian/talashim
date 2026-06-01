'use client';

import { Skeleton } from '@sadafgold/ui';
import { ProductCard } from '@/widgets/catalog/product-card';
import { useProductSearch } from '@/lib/api/hooks/use-products';

interface SearchResultsProps {
  query: string;
}

export function SearchResults({ query }: SearchResultsProps) {
  const { data, isLoading, isError } = useProductSearch({
    query,
    page: 1,
    limit: 24,
  });

  if (query.length < 2) {
    return <p className="text-sm text-muted">برای جستجو حداقل ۲ کاراکتر وارد کنید.</p>;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-rose-600">جستجو ناموفق بود.</p>;
  }

  if (!data?.items.length) {
    return <p className="text-sm text-muted">محصولی یافت نشد.</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        {data.total} نتیجه برای «{query}»
      </p>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {data.items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

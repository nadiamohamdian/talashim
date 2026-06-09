'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { IconMenuSearch } from '@/widgets/header/header-menu-icons';

interface ProductListingSearchFieldProps {
  defaultQuery?: string;
}

export function ProductListingSearchField({ defaultQuery = '' }: ProductListingSearchFieldProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(defaultQuery);

  useEffect(() => {
    setQuery(defaultQuery);
  }, [defaultQuery]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return;
    }

    const params = new URLSearchParams();
    params.set('q', trimmed);
    const category = searchParams.get('category');
    if (category) {
      params.set('category', category);
    }
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form className="product-listing-search" onSubmit={handleSubmit}>
      <input
        type="search"
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="product-listing-search-input"
        placeholder="جستجوی محصولات طلا و جواهر..."
        autoComplete="off"
        enterKeyHint="search"
        minLength={2}
        aria-label="جستجوی محصول"
      />
      <button type="submit" className="product-listing-search-submit" aria-label="جستجو">
        <IconMenuSearch className="product-listing-search-icon" />
      </button>
    </form>
  );
}

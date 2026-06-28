'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { cn } from '@sadafgold/ui';
import { IconMenuSearch } from '@/widgets/header/header-menu-icons';

interface StorefrontSearchBarProps {
  className?: string;
  defaultQuery?: string;
  autoFocus?: boolean;
  placeholder?: string;
  onSubmitted?: () => void;
}

export function StorefrontSearchBar({
  className,
  defaultQuery = '',
  autoFocus = false,
  placeholder = 'جستجوی محصولات طلا و جواهر...',
  onSubmitted,
}: StorefrontSearchBarProps) {
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
    onSubmitted?.();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('storefront-search-bar', className)}
      dir="rtl"
    >
      <button type="submit" className="storefront-search-bar-submit" aria-label="جستجو">
        <IconMenuSearch className="storefront-search-bar-icon" />
      </button>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="storefront-search-bar-input"
        autoFocus={autoFocus}
        autoComplete="off"
        enterKeyHint="search"
        minLength={2}
        aria-label="جستجوی محصول"
      />
    </form>
  );
}

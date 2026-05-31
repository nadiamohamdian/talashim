'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { cn } from '@sadafgold/ui';
import { STOREFRONT_CATEGORIES } from '@/shared/config/storefront-ia';
import { IconSearch } from '@/shared/ui/icons';

interface StoreSearchBarProps {
  className?: string;
}

export function StoreSearchBar({ className }: StoreSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (category) params.set('category', category);
    const qs = params.toString();
    router.push(qs ? `/search?${qs}` : '/products');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex overflow-hidden rounded-xl border border-nude-200 bg-card shadow-[var(--shadow-soft)]',
        className,
      )}
    >
      <select
        value={category}
        onChange={(event) => setCategory(event.target.value)}
        className="input-nude hidden min-w-[140px] border-0 border-l border-nude-200 bg-nude-50/80 px-3 py-3 text-sm sm:block"
        aria-label="دسته‌بندی"
      >
        <option value="">انتخاب دسته‌بندی</option>
        {STOREFRONT_CATEGORIES.map((item) => (
          <option key={item.slug} value={item.slug}>
            {item.labelFa}
          </option>
        ))}
      </select>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="جستجوی محصولات طلا و جواهر..."
        className="input-nude min-w-0 flex-1 border-0 px-4 py-3 text-sm placeholder:text-muted"
      />
      <button type="submit" className="btn-gold rounded-none px-5 py-3">
        <IconSearch className="h-4 w-4" />
        <span className="mr-2 hidden sm:inline">جستجو</span>
      </button>
    </form>
  );
}

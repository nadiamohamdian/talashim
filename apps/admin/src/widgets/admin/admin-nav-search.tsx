'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Search } from '@/shared/ui/icons';
import { ADMIN_FLAT_NAV } from '@/shared/config/admin-navigation';

export function AdminNavSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim();
    if (q.length < 1) return [];
    return ADMIN_FLAT_NAV.filter((item) => item.label.includes(q)).slice(0, 6);
  }, [query]);

  return (
    <div className="admin-nav-search relative hidden md:block">
      <Search className="admin-nav-search-icon" strokeWidth={1.5} aria-hidden />
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        placeholder="جستجو در بخش‌های پنل…"
        className="admin-nav-search-input"
        aria-label="جستجو در منوی پنل"
        autoComplete="off"
      />
      {open && results.length > 0 ? (
        <ul className="admin-nav-search-results" role="listbox">
          {results.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="admin-nav-search-result"
                onMouseDown={(e) => e.preventDefault()}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

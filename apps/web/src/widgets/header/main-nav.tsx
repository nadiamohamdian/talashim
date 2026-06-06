'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@sadafgold/ui';
import { PRIMARY_NAV, STOREFRONT_CATEGORIES } from '@/shared/config/storefront-ia';
import { useStorefrontSettings } from '@/shared/providers/storefront-settings-provider';
import { IconMenu } from '@/shared/ui/icons';

export function CategoryNavMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-xl border border-nude-200 bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-[var(--shadow-soft)] transition hover:border-gold-light hover:bg-nude-50"
      >
        <IconMenu className="h-4 w-4 text-gold-dark" />
        دسته‌بندی کالاها
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[2px]"
            aria-label="بستن منو"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-nude-200 bg-card p-2 shadow-[var(--shadow-card)]">
            {STOREFRONT_CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm text-foreground transition hover:bg-nude-50 hover:text-gold-dark"
              >
                {category.labelFa}
              </Link>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function MainNavLinks({ className }: { className?: string }) {
  const { featureFlags } = useStorefrontSettings();

  const links = [
    ...PRIMARY_NAV,
    ...(featureFlags.enableGoldTrading
      ? [{ label: 'معاملات طلا', href: '/trading' }]
      : []),
    ...(featureFlags.enableBlog ? [{ label: 'مجله', href: '/blog' }] : []),
  ];

  return (
    <nav className={cn('flex flex-wrap items-center gap-0.5', className)} aria-label="منوی اصلی">
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted transition hover:bg-nude-50 hover:text-gold-dark"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

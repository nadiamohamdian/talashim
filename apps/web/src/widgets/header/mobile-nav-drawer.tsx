'use client';

import Link from 'next/link';
import { useEffect, useId, useState } from 'react';
import { PRIMARY_NAV, STOREFRONT_CATEGORIES } from '@/shared/config/storefront-ia';
import { useStorefrontSettings } from '@/shared/providers/storefront-settings-provider';
import {
  IconMenuChevronDown,
  IconMenuChevronUp,
  IconMenuClose,
} from '@/widgets/header/header-menu-icons';

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORY_GROUP_ID = 'categories';

export function MobileNavDrawer({ open, onClose }: MobileNavDrawerProps) {
  const { featureFlags } = useStorefrontSettings();
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const submenuId = useId();

  const links = [
    ...PRIMARY_NAV,
    ...(featureFlags.enableGoldTrading
      ? [{ label: 'معاملات طلا', href: '/trading' }]
      : []),
    ...(featureFlags.enableBlog ? [{ label: 'مجله', href: '/blog' }] : []),
  ];

  useEffect(() => {
    if (!open) {
      setExpandedGroup(null);
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const categoriesExpanded = expandedGroup === CATEGORY_GROUP_ID;

  return (
    <>
      <button
        type="button"
        className="mobile-nav-drawer-overlay"
        aria-label="بستن منو"
        onClick={onClose}
      />

      <aside className="mobile-nav-drawer" aria-label="منوی موبایل">
        <div className="mobile-nav-drawer-top">
          <button
            type="button"
            className="mobile-nav-drawer-close"
            aria-label="بستن"
            onClick={onClose}
          >
            <IconMenuClose className="mobile-nav-drawer-close-icon" />
          </button>
        </div>

        <nav className="mobile-nav-drawer-nav" aria-label="ناوبری اصلی">
          <ul className="mobile-nav-drawer-list">
            <li className="mobile-nav-drawer-item mobile-nav-drawer-item-group">
              <button
                type="button"
                className="mobile-nav-drawer-row mobile-nav-drawer-row-parent"
                aria-expanded={categoriesExpanded}
                aria-controls={submenuId}
                onClick={() =>
                  setExpandedGroup((current) =>
                    current === CATEGORY_GROUP_ID ? null : CATEGORY_GROUP_ID,
                  )
                }
              >
                <span className="mobile-nav-drawer-row-label">دسته‌بندی کالاها</span>
                {categoriesExpanded ? (
                  <IconMenuChevronUp className="mobile-nav-drawer-chevron" />
                ) : (
                  <IconMenuChevronDown className="mobile-nav-drawer-chevron" />
                )}
              </button>

              {categoriesExpanded ? (
                <ul id={submenuId} className="mobile-nav-drawer-submenu">
                  {STOREFRONT_CATEGORIES.map((category) => (
                    <li key={category.slug} className="mobile-nav-drawer-subitem">
                      <Link
                        href={`/categories/${category.slug}`}
                        onClick={onClose}
                        className="mobile-nav-drawer-sublink"
                      >
                        {category.labelFa}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>

            {links.map((item) => (
              <li key={item.href} className="mobile-nav-drawer-item">
                <Link href={item.href} onClick={onClose} className="mobile-nav-drawer-row mobile-nav-drawer-link">
                  {item.label}
                </Link>
              </li>
            ))}

            <li className="mobile-nav-drawer-item">
              <Link
                href="/products?sale=1"
                onClick={onClose}
                className="mobile-nav-drawer-row mobile-nav-drawer-link mobile-nav-drawer-link-accent"
              >
                تخفیف‌های روز
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}

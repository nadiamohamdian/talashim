'use client';

import Link from 'next/link';
import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { MOBILE_HAMBURGER_MENU } from '@/shared/config/storefront-ia';
import {
  IconMenuChevronDown,
  IconMenuChevronUp,
  IconMenuClose,
  IconMenuHome,
} from '@/widgets/header/header-menu-icons';

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNavDrawer({ open, onClose }: MobileNavDrawerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const submenuId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setExpandedId(null);
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

  if (!open || !mounted) return null;

  return createPortal(
    <>
      <button
        type="button"
        className="mobile-nav-drawer-overlay"
        aria-label="بستن منو"
        onClick={onClose}
      />

      <aside className="mobile-nav-drawer" aria-label="منوی موبایل">
        <div className="mobile-nav-drawer-head">
          <Link href="/" onClick={onClose} className="mobile-nav-drawer-home" aria-label="صفحه اصلی">
            <IconMenuHome className="mobile-nav-drawer-home-icon" />
          </Link>

          <button
            type="button"
            className="mobile-nav-drawer-close"
            aria-label="بستن منو"
            onClick={onClose}
          >
            <IconMenuClose className="mobile-nav-drawer-close-icon" />
          </button>
        </div>

        <nav className="mobile-nav-drawer-nav" aria-label="ناوبری اصلی">
          <ul className="mobile-nav-drawer-list">
            {MOBILE_HAMBURGER_MENU.map((item, index) => {
              const hasNested = Boolean(item.subLinks?.length);
              const isExpanded = expandedId === item.id;
              const isLast = index === MOBILE_HAMBURGER_MENU.length - 1;

              return (
                <li key={item.id} className="mobile-nav-drawer-item">
                  {hasNested ? (
                    <>
                      <button
                        type="button"
                        className="mobile-nav-drawer-row mobile-nav-drawer-row-parent"
                        aria-expanded={isExpanded}
                        aria-controls={`${submenuId}-${item.id}`}
                        onClick={() =>
                          setExpandedId((current) => (current === item.id ? null : item.id))
                        }
                      >
                        <span className="mobile-nav-drawer-row-label">{item.label}</span>
                        {isExpanded ? (
                          <IconMenuChevronUp className="mobile-nav-drawer-chevron" />
                        ) : (
                          <IconMenuChevronDown className="mobile-nav-drawer-chevron" />
                        )}
                      </button>

                      {isExpanded ? (
                        <div id={`${submenuId}-${item.id}`} className="mobile-nav-drawer-nested">
                          {item.subLinks ? (
                            <ul className="mobile-nav-drawer-sublist">
                              {item.subLinks.map((subLink) => (
                                <li key={subLink.href} className="mobile-nav-drawer-subitem">
                                  <Link
                                    href={subLink.href}
                                    onClick={onClose}
                                    className="mobile-nav-drawer-sublink"
                                  >
                                    {subLink.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          ) : null}

                          {item.priceRanges ? (
                            <div className="mobile-nav-drawer-price-panel">
                              {item.priceRanges.map((range) => (
                                <Link
                                  key={range.href}
                                  href={range.href}
                                  onClick={onClose}
                                  className="mobile-nav-drawer-price-link"
                                >
                                  {range.label}
                                </Link>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <Link
                      href={item.href ?? '/products'}
                      onClick={onClose}
                      className="mobile-nav-drawer-row mobile-nav-drawer-link"
                    >
                      {item.label}
                    </Link>
                  )}

                  {!isLast ? <span className="mobile-nav-drawer-divider" aria-hidden /> : null}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>,
    document.body,
  );
}

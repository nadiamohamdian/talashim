'use client';

import Link from 'next/link';
import { GIFT_BUDGET_RANGES } from '@/shared/config/storefront-ia';
import { parseProductPriceFilter } from '@/shared/lib/product-price-filter';

const BUDGET_ITEM_CORNERS = ['tl', 'tr', 'bl', 'br'] as const;

interface GiftBudgetShowcaseProps {
  minPrice?: number;
  maxPrice?: number;
}

function isActiveRange(
  rangeHref: string,
  minPrice?: number,
  maxPrice?: number,
): boolean {
  const url = new URL(rangeHref, 'http://localhost');
  const filter = parseProductPriceFilter({
    minPrice: url.searchParams.get('minPrice') ?? undefined,
    maxPrice: url.searchParams.get('maxPrice') ?? undefined,
  });
  return filter.minPrice === minPrice && filter.maxPrice === maxPrice;
}

export function GiftBudgetShowcase({ minPrice, maxPrice }: GiftBudgetShowcaseProps) {
  const hasSelection = minPrice != null || maxPrice != null;

  return (
    <section
      className="budget-showcase budget-showcase--gift-listing"
      aria-labelledby="gift-budget-showcase-title"
    >
      <div className="budget-showcase-frame">
        <div className="budget-showcase-content">
          <h2 id="gift-budget-showcase-title" className="budget-showcase-title">
            بودجه هدیه خود را انتخاب کنید
          </h2>

          <div className="budget-showcase-grid-wrap">
            <ul className="budget-showcase-list">
              {GIFT_BUDGET_RANGES.map((range, index) => {
                const active = isActiveRange(range.href, minPrice, maxPrice);
                return (
                  <li key={range.id} className="budget-showcase-item">
                    <span
                      className={`budget-showcase-corner budget-showcase-corner--${BUDGET_ITEM_CORNERS[index]}`}
                      aria-hidden
                    />
                    <Link
                      href={range.href}
                      className={`budget-showcase-btn${active ? ' is-active' : ''}`}
                      aria-current={active ? 'true' : undefined}
                    >
                      {range.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {hasSelection ? (
            <p className="budget-showcase-hint">
              <Link href="/products?type=gold_jewelry" className="budget-showcase-reset">
                مشاهده همه هدایای طلا
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

'use client';

import Link from 'next/link';
import { HOME_BUDGET_RANGES } from '@/shared/config/storefront-ia';

/** RTL 2×2 grid — outer corner accent per cell (Figma 1875:948) */
const BUDGET_ITEM_CORNERS = ['tl', 'tr', 'bl', 'br'] as const;

export function BudgetShowcase() {
  return (
    <section className="budget-showcase" aria-labelledby="budget-showcase-title">
      <div className="budget-showcase-frame">
        <div className="budget-showcase-content">
          <h2 id="budget-showcase-title" className="budget-showcase-title">
            هر بودجه‌ای، یک انتخاب درخشان دارد
          </h2>

          <div className="budget-showcase-grid-wrap">
            <ul className="budget-showcase-list">
              {HOME_BUDGET_RANGES.map((range, index) => (
                <li key={range.id} className="budget-showcase-item">
                  <span
                    className={`budget-showcase-corner budget-showcase-corner--${BUDGET_ITEM_CORNERS[index]}`}
                    aria-hidden
                  />
                  <Link href={range.href} className="budget-showcase-btn">
                    {range.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

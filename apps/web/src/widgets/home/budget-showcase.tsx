'use client';

import Link from 'next/link';
import { HOME_BUDGET_RANGES } from '@/shared/config/storefront-ia';

const COIN_IMAGE =
  '/images/home/94ea6cc1714e5ef26c4230e1b531377d_1-removebg-preview%201_Nero_AI_Background_Remover_transparent.png';

export function BudgetShowcase() {
  return (
    <section className="budget-showcase" aria-labelledby="budget-showcase-title">
      <div className="budget-showcase-frame">
        <div className="budget-showcase-content">
          <h2 id="budget-showcase-title" className="budget-showcase-title">
            هر بودجه‌ای، یک انتخاب درخشان دارد
          </h2>

          <ul className="budget-showcase-list">
            {HOME_BUDGET_RANGES.map((range) => (
              <li key={range.id}>
                <Link href={range.href} className="budget-showcase-btn">
                  {range.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="budget-showcase-coin" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={COIN_IMAGE} alt="" className="budget-showcase-coin-image" decoding="async" />
      </div>
    </section>
  );
}

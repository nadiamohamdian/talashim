'use client';

import Image from 'next/image';
import Link from 'next/link';
import { HOME_BUDGET_RANGES } from '@/shared/config/storefront-ia';

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

        <div className="budget-showcase-coin" aria-hidden>
          <Image
            src="/images/home/krugerrand-coin.png"
            alt=""
            width={340}
            height={93}
            className="budget-showcase-coin-image"
            priority={false}
          />
        </div>
      </div>
    </section>
  );
}

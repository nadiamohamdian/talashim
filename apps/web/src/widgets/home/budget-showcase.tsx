'use client';

import Link from 'next/link';
import { HOME_BUDGET_RANGES } from '@/shared/config/storefront-ia';

const BUDGET_MOBILE_COIN_IMAGE =
  '/images/home/94ea6cc1714e5ef26c4230e1b531377d_1-removebg-preview%201_Nero_AI_Background_Remover_transparent.png';

const BUDGET_DESKTOP_COIN_IMAGE =
  '/images/home/94ea6cc1714e5ef26c4230e1b531377d_1-removebg-preview%202.jpg';

export function BudgetShowcase() {
  return (
    <section className="budget-showcase" aria-labelledby="budget-showcase-title">
      <div className="budget-showcase-frame">
        <div className="budget-showcase-content">
          <h2 id="budget-showcase-title" className="budget-showcase-title">
            هر بودجه‌ای، یک انتخاب درخشان دارد
          </h2>

          <div className="budget-showcase-grid-wrap">
            <span className="budget-showcase-corner budget-showcase-corner--tl" aria-hidden />
            <span className="budget-showcase-corner budget-showcase-corner--tr" aria-hidden />
            <span className="budget-showcase-corner budget-showcase-corner--bl" aria-hidden />
            <span className="budget-showcase-corner budget-showcase-corner--br" aria-hidden />

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

        <div className="budget-showcase-coin budget-showcase-coin--desktop" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={BUDGET_DESKTOP_COIN_IMAGE}
            alt=""
            className="budget-showcase-coin-image"
            decoding="async"
          />
        </div>
      </div>

      <div className="budget-showcase-coin budget-showcase-coin--mobile" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={BUDGET_MOBILE_COIN_IMAGE}
          alt=""
          className="budget-showcase-coin-image"
          decoding="async"
        />
      </div>
    </section>
  );
}

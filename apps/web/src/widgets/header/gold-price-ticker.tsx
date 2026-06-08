'use client';

import {
  formatGoldPricePerGramToman,
  GOLD_PRICE_PER_GRAM_UNIT_FA,
} from '@sadafgold/shared';
import { useMarketPrices } from '@/lib/api/hooks/use-market-prices';

const GOLD_18_LIVE = { symbol: 'XAU-IRR' as const, karat: 18 };

export function GoldPriceTicker() {
  const { data, isPending } = useMarketPrices(GOLD_18_LIVE);
  const spot = data ? Number(data.pricePerGram) : null;
  const hasPrice = spot != null && Number.isFinite(spot) && spot > 0;
  const loading = isPending && !hasPrice;

  return (
    <div
      className="topbar-shimmer border-b border-nude-200/80"
      aria-live="polite"
      aria-label="قیمت لحظه‌ای طلا"
    >
      <div className="container-store flex items-center justify-center gap-2 py-2.5 text-sm">
        <span className="badge-gold hidden sm:inline-flex">قیمت روز</span>
        {loading ? (
          <span className="text-muted">در حال دریافت قیمت طلا...</span>
        ) : hasPrice ? (
          <span>
            <span className="text-muted">طلای ۱۸:</span>{' '}
            <span className="font-bold text-gold-dark">
              {formatGoldPricePerGramToman(spot)} {GOLD_PRICE_PER_GRAM_UNIT_FA}
            </span>
          </span>
        ) : (
          <span className="text-muted">قیمت لحظه‌ای در دسترس نیست</span>
        )}
      </div>
    </div>
  );
}

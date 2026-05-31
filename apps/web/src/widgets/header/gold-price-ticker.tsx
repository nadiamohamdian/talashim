'use client';

import type { GoldTickerPayload } from '@sadafgold/shared';
import { formatPrice } from '@/shared/lib/format-price';
import { useGoldTicker } from '@/lib/api/hooks/use-market-prices';

function findPrimaryGold18(items: GoldTickerPayload['items']) {
  return (
    items.find((item) => item.symbol === 'IR_GOLD_18K' || item.symbol === 'IR_GOLD_18') ??
    items.find((item) => item.name.includes('18')) ??
    items[0]
  );
}

export function GoldPriceTicker() {
  const { data, isPending } = useGoldTicker();
  const primary = data?.items ? findPrimaryGold18(data.items) : undefined;
  const loading = isPending && !primary;

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
        ) : primary ? (
          <span>
            <span className="text-muted">{primary.name}:</span>{' '}
            <span className="font-bold text-gold-dark">
              {formatPrice(primary.price)} {primary.unit}
            </span>
          </span>
        ) : (
          <span className="text-muted">قیمت لحظه‌ای در دسترس نیست</span>
        )}
      </div>
    </div>
  );
}

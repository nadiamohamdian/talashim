'use client';

import { useQuery } from '@tanstack/react-query';
import {
  formatGoldPricePerGramToman,
  GOLD_PRICE_PER_GRAM_UNIT_FA,
} from '@sadafgold/shared';
import { TrendingUp } from '@/shared/ui/icons';
import { fetchAdminLivePrice } from '@/features/pricing/api/pricing-admin-api';
import { adminQueryKeys } from '@/lib/api/query-keys';

export function AdminGoldPill() {
  const { data } = useQuery({
    queryKey: adminQueryKeys.pricing.live('XAU-IRR', 18),
    queryFn: () => fetchAdminLivePrice({ symbol: 'XAU-IRR', karat: 18 }),
    refetchInterval: 30_000,
  });

  const price = data ? formatGoldPricePerGramToman(data.pricePerGram) : '—';

  return (
    <div className="admin-gold-pill" title="قیمت لحظه‌ای طلای ۱۸ عیار">
      <TrendingUp className="size-3.5 shrink-0 text-[var(--primary)]" strokeWidth={1.5} aria-hidden />
      <span className="admin-gold-pill-label">طلای ۱۸</span>
      <span className="admin-gold-pill-value">{price}</span>
      <span className="admin-gold-pill-unit">{GOLD_PRICE_PER_GRAM_UNIT_FA}</span>
    </div>
  );
}

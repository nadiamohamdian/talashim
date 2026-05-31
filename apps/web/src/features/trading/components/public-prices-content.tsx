'use client';

import { LivePriceCard } from '@/features/trading/components/live-price-card';
import { PriceChart } from '@/features/trading/components/price-chart';

export function PublicPricesContent() {
  return (
    <div className="space-y-6">
      <LivePriceCard />
      <PriceChart />
    </div>
  );
}

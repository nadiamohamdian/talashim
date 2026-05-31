import { computeTradeQuote } from '@sadafgold/shared/trade-quote';
import { webEnv } from '@/shared/config/env';
import type { TradeSide } from '@sadafgold/types';

export function estimateTradeQuote(input: {
  side: TradeSide;
  quantityGram: number;
  unitPriceToman: number;
}) {
  return computeTradeQuote({
    ...input,
    commissionPercent: webEnv.NEXT_PUBLIC_GOLD_TRADE_COMMISSION_PERCENT,
  });
}

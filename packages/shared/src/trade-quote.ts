export type TradeSide = 'BUY' | 'SELL';

export interface TradeQuoteInput {
  side: TradeSide;
  quantityGram: number;
  unitPriceToman: number;
  commissionPercent: number;
}

export interface TradeQuoteResult {
  grossRial: number;
  commissionRial: number;
  netRial: number;
  commissionPercent: number;
}

/** Server-authoritative trade quote (commission on top for BUY, deducted for SELL). */
export function computeTradeQuote(input: TradeQuoteInput): TradeQuoteResult {
  const grossRial = Math.round(input.quantityGram * input.unitPriceToman);
  const commissionRial = Math.round((grossRial * input.commissionPercent) / 100);

  if (input.side === 'BUY') {
    return {
      grossRial,
      commissionRial,
      netRial: grossRial + commissionRial,
      commissionPercent: input.commissionPercent,
    };
  }

  return {
    grossRial,
    commissionRial,
    netRial: grossRial - commissionRial,
    commissionPercent: input.commissionPercent,
  };
}

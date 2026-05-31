import { computeTradeQuote } from './trade-quote';

describe('computeTradeQuote', () => {
  it('calculates buy totals with commission on top', () => {
    const quote = computeTradeQuote({
      side: 'BUY',
      quantityGram: 2,
      unitPriceToman: 10_000_000,
      commissionPercent: 0.5,
    });

    expect(quote.grossRial).toBe(20_000_000);
    expect(quote.commissionRial).toBe(100_000);
    expect(quote.netRial).toBe(20_100_000);
  });

  it('calculates sell payout net of commission', () => {
    const quote = computeTradeQuote({
      side: 'SELL',
      quantityGram: 1,
      unitPriceToman: 9_900_000,
      commissionPercent: 1,
    });

    expect(quote.grossRial).toBe(9_900_000);
    expect(quote.commissionRial).toBe(99_000);
    expect(quote.netRial).toBe(9_801_000);
  });
});

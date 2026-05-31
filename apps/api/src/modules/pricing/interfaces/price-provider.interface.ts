export interface GoldSpotQuote {
  symbol: string;
  karat: number;
  pricePerGramToman: number;
  capturedAt: Date;
  providerName: string;
}

export interface GoldPriceProvider {
  readonly name: string;
  fetchSpotQuote(symbol: string, karat: number): Promise<GoldSpotQuote>;
}

export const GOLD_PRICE_PRIMARY_PROVIDER = Symbol('GOLD_PRICE_PRIMARY_PROVIDER');
export const GOLD_PRICE_FALLBACK_PROVIDER = Symbol('GOLD_PRICE_FALLBACK_PROVIDER');

import { Injectable } from '@nestjs/common';
import type {
  GoldPriceProvider,
  GoldSpotQuote,
} from '../interfaces/price-provider.interface';

@Injectable()
export class FallbackGoldPriceProvider implements GoldPriceProvider {
  readonly name = 'fallback-static';

  async fetchSpotQuote(symbol: string, karat: number): Promise<GoldSpotQuote> {
    const baseline18k = 8_450_000;
    const purityFactor = karat / 18;

    return {
      symbol,
      karat,
      pricePerGramToman: Math.round(baseline18k * purityFactor),
      capturedAt: new Date(),
      providerName: this.name,
    };
  }
}

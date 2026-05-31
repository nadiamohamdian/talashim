import { Injectable, Logger } from '@nestjs/common';
import {
  fetchBrsGoldQuotes,
  findBrsQuoteForKarat,
} from '@sadafgold/shared';
import { getApiEnv } from '@/config/env';
import type {
  GoldPriceProvider,
  GoldSpotQuote,
} from '../interfaces/price-provider.interface';

@Injectable()
export class PrimaryGoldPriceProvider implements GoldPriceProvider {
  readonly name = 'brsapi';
  private readonly logger = new Logger(PrimaryGoldPriceProvider.name);

  async fetchSpotQuote(symbol: string, karat: number): Promise<GoldSpotQuote> {
    const env = getApiEnv();

    if (env.BRS_API_KEY) {
      const quotes = await fetchBrsGoldQuotes({
        apiKey: env.BRS_API_KEY,
        url: env.BRS_API_URL,
      });
      const match = findBrsQuoteForKarat(quotes, karat);

      if (!match) {
        throw new Error(`No BrsApi quote found for ${karat}K gold`);
      }

      return {
        symbol,
        karat,
        pricePerGramToman: Math.round(match.price),
        capturedAt: match.time_unix
          ? new Date(match.time_unix * 1000)
          : new Date(),
        providerName: this.name,
      };
    }

    if (env.GOLD_PRICE_PRIMARY_URL) {
      const response = await fetch(
        `${env.GOLD_PRICE_PRIMARY_URL}?symbol=${symbol}&karat=${karat}`,
        { signal: AbortSignal.timeout(4_000) },
      );

      if (!response.ok) {
        throw new Error(`Primary provider responded with ${response.status}`);
      }

      const payload = (await response.json()) as {
        pricePerGramToman: number;
        capturedAt?: string;
      };

      return {
        symbol,
        karat,
        pricePerGramToman: Number(payload.pricePerGramToman),
        capturedAt: payload.capturedAt ? new Date(payload.capturedAt) : new Date(),
        providerName: this.name,
      };
    }

    const baseline18k = 8_500_000;
    const purityFactor = karat / 18;
    const microShift = Math.sin(Date.now() / 60_000) * 25_000;
    const pricePerGramToman = Math.round(baseline18k * purityFactor + microShift);

    this.logger.debug(`Using simulated primary quote for ${symbol} ${karat}K`);

    return {
      symbol,
      karat,
      pricePerGramToman,
      capturedAt: new Date(),
      providerName: this.name,
    };
  }
}

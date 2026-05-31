import { Injectable, Logger } from '@nestjs/common';
import {
  buildFallbackMarketSnapshot,
  buildMarketPricesSnapshot,
  fetchBrsRawPayload,
  parseBrsAllQuotes,
  type MarketPricesSnapshot,
} from '@sadafgold/shared';
import { getApiEnv } from '@/config/env';
import type { MarketDataProvider } from '../interfaces/market-data-provider.interface';

@Injectable()
export class BrsService implements MarketDataProvider {
  readonly name = 'brsapi';
  private readonly logger = new Logger(BrsService.name);

  async fetchSnapshot(): Promise<MarketPricesSnapshot> {
    const env = getApiEnv();

    if (!env.BRS_API_KEY) {
      this.logger.warn('BRS_API_KEY is not configured — using fallback market snapshot');
      return buildFallbackMarketSnapshot(this.name);
    }

    const raw = await fetchBrsRawPayload({
      apiKey: env.BRS_API_KEY,
      url: env.BRS_API_URL,
      baseUrl: env.BRS_BASE_URL,
      timeoutMs: env.BRS_REQUEST_TIMEOUT_MS,
    });
    const quotes = parseBrsAllQuotes(raw);

    if (quotes.length === 0) {
      throw new Error('BrsApi returned an empty market payload');
    }

    return buildMarketPricesSnapshot({
      quotes,
      fetchedAt: new Date().toISOString(),
      source: 'brsapi',
      provider: this.name,
    });
  }

}

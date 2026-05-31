import { Inject, Injectable, Logger } from '@nestjs/common';
import { getApiEnv } from '@/config/env';
import {
  MARKET_DATA_FALLBACK_PROVIDER,
  MARKET_DATA_PRIMARY_PROVIDER,
  type MarketDataProvider,
} from '../interfaces/market-data-provider.interface';
import { BrsService } from '../services/brs.service';
import { FallbackMarketProvider } from './fallback-market.provider';

@Injectable()
export class BrsMarketProvider implements MarketDataProvider {
  readonly name = 'brsapi-resilient';
  private readonly logger = new Logger(BrsMarketProvider.name);

  constructor(
    private readonly brsService: BrsService,
    @Inject(MARKET_DATA_FALLBACK_PROVIDER)
    private readonly fallbackProvider: MarketDataProvider,
  ) {}

  async fetchSnapshot() {
    const env = getApiEnv();
    let lastError: unknown;

    for (let attempt = 0; attempt <= env.BRS_MAX_RETRIES; attempt += 1) {
      try {
        return await this.brsService.fetchSnapshot();
      } catch (error) {
        lastError = error;
        const message = error instanceof Error ? error.message : 'unknown';
        this.logger.warn(
          `BRS market fetch failed (attempt ${attempt + 1}/${env.BRS_MAX_RETRIES + 1}): ${message}`,
        );

        if (attempt < env.BRS_MAX_RETRIES) {
          await this.delay(250 * (attempt + 1));
        }
      }
    }

    this.logger.error(
      `BRS market fetch exhausted retries: ${lastError instanceof Error ? lastError.message : 'unknown'}`,
    );
    return this.fallbackProvider.fetchSnapshot();
  }

  private delay(ms: number) {
    return new Promise<void>((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}

/** DI token binding — primary provider delegates to resilient BRS wrapper. */
export const primaryMarketProviderFactory = {
  provide: MARKET_DATA_PRIMARY_PROVIDER,
  useExisting: BrsMarketProvider,
};

export const fallbackMarketProviderFactory = {
  provide: MARKET_DATA_FALLBACK_PROVIDER,
  useClass: FallbackMarketProvider,
};

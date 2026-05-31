import { Injectable, Logger } from '@nestjs/common';
import { buildFallbackMarketSnapshot, type MarketPricesSnapshot } from '@sadafgold/shared';
import type { MarketDataProvider } from '../interfaces/market-data-provider.interface';

@Injectable()
export class FallbackMarketProvider implements MarketDataProvider {
  readonly name = 'fallback-static';
  private readonly logger = new Logger(FallbackMarketProvider.name);

  async fetchSnapshot(): Promise<MarketPricesSnapshot> {
    this.logger.debug('Serving static fallback market snapshot');
    return buildFallbackMarketSnapshot(this.name);
  }
}

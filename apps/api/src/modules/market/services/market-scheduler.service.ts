import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { getApiEnv } from '@/config/env';
import { MarketService } from './market.service';

@Injectable()
export class MarketSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MarketSchedulerService.name);
  private timer: NodeJS.Timeout | null = null;

  constructor(private readonly marketService: MarketService) {}

  onModuleInit() {
    const env = getApiEnv();
    void this.marketService.syncFromProvider().catch((error) => {
      const message = error instanceof Error ? error.message : 'unknown';
      this.logger.warn(`Initial market sync failed: ${message}`);
    });
    this.timer = setInterval(() => {
      void this.marketService.syncFromProvider().catch((error) => {
        const message = error instanceof Error ? error.message : 'unknown';
        this.logger.warn(`Scheduled market sync failed: ${message}`);
      });
    }, env.MARKET_SYNC_INTERVAL_MS);
    this.logger.log(`Market sync scheduler started (${env.MARKET_SYNC_INTERVAL_MS}ms)`);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}

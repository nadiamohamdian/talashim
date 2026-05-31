import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { getApiEnv } from '@/config/env';
import { PricingEngineService } from './pricing-engine.service';
import { PricingGateway } from '../gateways/pricing.gateway';

@Injectable()
export class PricingSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PricingSchedulerService.name);
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly pricingEngine: PricingEngineService,
    private readonly pricingGateway: PricingGateway,
  ) {}

  onModuleInit() {
    const env = getApiEnv();
    void this.runRefresh();
    this.timer = setInterval(() => void this.runRefresh(), env.GOLD_PRICE_REFRESH_MS);
    this.logger.log(`Gold pricing scheduler started (${env.GOLD_PRICE_REFRESH_MS}ms)`);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async runRefresh(symbol = 'XAU-IRR', karat = 18) {
    try {
      const price = await this.pricingEngine.refreshLivePrice(symbol, karat);
      this.pricingGateway.broadcastPriceUpdate(price);
      return price;
    } catch (error) {
      this.logger.error(
        `Pricing refresh failed: ${error instanceof Error ? error.message : 'unknown'}`,
      );
    }
  }
}

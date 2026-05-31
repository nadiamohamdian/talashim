import { Module } from '@nestjs/common';
import { MarketController } from './controllers/market.controller';
import {
  BrsMarketProvider,
  fallbackMarketProviderFactory,
  primaryMarketProviderFactory,
} from './providers/brs-market.provider';
import { FallbackMarketProvider } from './providers/fallback-market.provider';
import { BrsService } from './services/brs.service';
import { MarketCacheHealthService } from './services/market-cache-health.service';
import { MarketCacheService } from './services/market-cache.service';
import { MarketSchedulerService } from './services/market-scheduler.service';
import { MarketService } from './services/market.service';

@Module({
  controllers: [MarketController],
  providers: [
    BrsService,
    BrsMarketProvider,
    FallbackMarketProvider,
    fallbackMarketProviderFactory,
    primaryMarketProviderFactory,
    MarketCacheService,
    MarketCacheHealthService,
    MarketService,
    MarketSchedulerService,
  ],
  exports: [MarketService, MarketCacheService, MarketCacheHealthService],
})
export class MarketModule {}

import { Module } from '@nestjs/common';
import {
  GOLD_PRICE_FALLBACK_PROVIDER,
  GOLD_PRICE_PRIMARY_PROVIDER,
} from './interfaces/price-provider.interface';
import { PrimaryGoldPriceProvider } from './providers/primary-gold-price.provider';
import { FallbackGoldPriceProvider } from './providers/fallback-gold-price.provider';
import { PricingController } from './controllers/pricing.controller';
import { PricingGateway } from './gateways/pricing.gateway';
import { PricingConfigRepository } from './repositories/pricing-config.repository';
import { PricingRepository } from './repositories/pricing.repository';
import { PricingCacheService } from './services/pricing-cache.service';
import { PricingEngineService } from './services/pricing-engine.service';
import { PricingSchedulerService } from './services/pricing-scheduler.service';

@Module({
  controllers: [PricingController],
  providers: [
    PricingRepository,
    PricingConfigRepository,
    PricingCacheService,
    PricingEngineService,
    PricingSchedulerService,
    PricingGateway,
    PrimaryGoldPriceProvider,
    FallbackGoldPriceProvider,
    {
      provide: GOLD_PRICE_PRIMARY_PROVIDER,
      useExisting: PrimaryGoldPriceProvider,
    },
    {
      provide: GOLD_PRICE_FALLBACK_PROVIDER,
      useExisting: FallbackGoldPriceProvider,
    },
  ],
  exports: [
    PricingEngineService,
    PricingGateway,
    PricingRepository,
    PricingConfigRepository,
    PrimaryGoldPriceProvider,
    FallbackGoldPriceProvider,
  ],
})
export class PricingModule {}

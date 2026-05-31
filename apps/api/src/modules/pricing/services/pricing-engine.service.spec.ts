import { GoldPriceSource } from '@/generated/prisma';
import type { GoldPriceProvider } from '../interfaces/price-provider.interface';
import { PricingEngineService } from './pricing-engine.service';
import type { PricingCacheService } from './pricing-cache.service';
import type { PricingRepository } from '../repositories/pricing.repository';

jest.mock('@/config/env', () => ({
  getApiEnv: () => ({
    GOLD_SPREAD_PERCENT: 2,
  }),
}));

describe('PricingEngineService', () => {
  let service: PricingEngineService;
  let primary: jest.Mocked<GoldPriceProvider>;
  let fallback: jest.Mocked<GoldPriceProvider>;
  let cache: jest.Mocked<Pick<PricingCacheService, 'getLatest' | 'setLatest'>>;
  let repository: jest.Mocked<
    Pick<PricingRepository, 'saveTick' | 'findLatest'>
  >;

  beforeEach(() => {
    primary = {
      name: 'primary-market',
      fetchSpotQuote: jest.fn(),
    };
    fallback = {
      name: 'fallback-static',
      fetchSpotQuote: jest.fn(),
    };
    cache = {
      getLatest: jest.fn().mockResolvedValue(null),
      setLatest: jest.fn().mockResolvedValue(undefined),
    };
    repository = {
      saveTick: jest.fn().mockResolvedValue({ id: 'tick-1' }),
      findLatest: jest.fn().mockResolvedValue(null),
    };

    service = new PricingEngineService(
      primary,
      fallback,
      cache as unknown as PricingCacheService,
      repository as unknown as PricingRepository,
    );
  });

  it('uses primary provider and applies spread', async () => {
    primary.fetchSpotQuote.mockResolvedValue({
      symbol: 'XAU-IRR',
      karat: 18,
      pricePerGramToman: 10_000_000,
      capturedAt: new Date('2026-01-01T00:00:00.000Z'),
      providerName: 'primary-market',
    });

    const price = await service.refreshLivePrice();

    expect(primary.fetchSpotQuote).toHaveBeenCalledWith('XAU-IRR', 18);
    expect(fallback.fetchSpotQuote).not.toHaveBeenCalled();
    expect(price.source).toBe(GoldPriceSource.PRIMARY);
    expect(price.pricePerGram).toBe('10000000');
    expect(price.buyPrice).toBe('9900000');
    expect(price.sellPrice).toBe('10100000');
    expect(cache.setLatest).toHaveBeenCalledWith(price);
    expect(repository.saveTick).toHaveBeenCalled();
  });

  it('falls back when primary provider fails', async () => {
    primary.fetchSpotQuote.mockRejectedValue(new Error('upstream down'));
    fallback.fetchSpotQuote.mockResolvedValue({
      symbol: 'XAU-IRR',
      karat: 18,
      pricePerGramToman: 8_450_000,
      capturedAt: new Date('2026-01-01T00:00:00.000Z'),
      providerName: 'fallback-static',
    });

    const price = await service.refreshLivePrice();

    expect(fallback.fetchSpotQuote).toHaveBeenCalledWith('XAU-IRR', 18);
    expect(price.source).toBe(GoldPriceSource.FALLBACK);
    expect(price.providerName).toBe('fallback-static');
  });

  it('returns cached live price when available', async () => {
    const cached = {
      symbol: 'XAU-IRR',
      karat: 18,
      pricePerGram: '9000000',
      buyPrice: '8910000',
      sellPrice: '9090000',
      spreadPercent: '2.0000',
      source: GoldPriceSource.PRIMARY,
      providerName: 'primary-market',
      recordedAt: '2026-01-01T00:00:00.000Z',
    };
    cache.getLatest.mockResolvedValue(cached);

    const price = await service.getLivePrice();

    expect(price).toEqual(cached);
    expect(primary.fetchSpotQuote).not.toHaveBeenCalled();
  });
});

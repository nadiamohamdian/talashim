import { Injectable, NotFoundException } from '@nestjs/common';
import { ADMIN_PERMISSIONS } from '@talashim/shared/admin-rbac';
import type {
  GoldPriceOverrideDto,
  GoldPriceHistoryItemDto,
  LiveGoldPriceDto,
  PricingMarginsDto,
  PricingProvidersResponseDto,
} from '@talashim/types';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { assertAdminPermission } from '@/common/rbac/assert-admin-permission';
import { getApiEnv } from '@/config/env';
import { GoldPriceSource } from '@/generated/prisma';
import { MarketCacheHealthService } from '@/modules/market/services/market-cache-health.service';
import type { LiveGoldPriceDto as EngineLiveDto } from '@/modules/pricing/dto/gold-price.dto';
import { PricingConfigRepository } from '@/modules/pricing/repositories/pricing-config.repository';
import { PricingRepository } from '@/modules/pricing/repositories/pricing.repository';
import { PricingEngineService } from '@/modules/pricing/services/pricing-engine.service';
import { PricingGateway } from '@/modules/pricing/gateways/pricing.gateway';
import {
  PrimaryGoldPriceProvider,
} from '@/modules/pricing/providers/primary-gold-price.provider';
import {
  FallbackGoldPriceProvider,
} from '@/modules/pricing/providers/fallback-gold-price.provider';
import type {
  AdminOverridesQueryDto,
  AdminPriceHistoryQueryDto,
  UpdatePricingMarginsDto,
  UpsertGoldPriceOverrideDto,
} from '../dto/admin-pricing.dto';

@Injectable()
export class AdminPricingService {
  constructor(
    private readonly pricingEngine: PricingEngineService,
    private readonly pricingRepository: PricingRepository,
    private readonly pricingConfigRepository: PricingConfigRepository,
    private readonly pricingGateway: PricingGateway,
    private readonly marketHealth: MarketCacheHealthService,
    private readonly primaryProvider: PrimaryGoldPriceProvider,
    private readonly fallbackProvider: FallbackGoldPriceProvider,
  ) {}

  async getLive(
    symbol: string | undefined,
    karat: number | undefined,
    actor: AuthenticatedUser,
  ): Promise<LiveGoldPriceDto> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.pricing.read);
    const price = await this.pricingEngine.getLivePrice(symbol ?? 'XAU-IRR', karat ?? 18);
    return this.mapLive(price);
  }

  async refreshLive(
    symbol: string | undefined,
    karat: number | undefined,
    actor: AuthenticatedUser,
  ): Promise<LiveGoldPriceDto> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.pricing.configure);
    const price = await this.pricingEngine.refreshLivePrice(symbol ?? 'XAU-IRR', karat ?? 18);
    this.pricingGateway.broadcastPriceUpdate(price);
    return this.mapLive(price);
  }

  async getHistory(query: AdminPriceHistoryQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.pricing.read);

    const symbol = query.symbol ?? 'XAU-IRR';
    const karat = query.karat ?? 18;
    const to = query.to ? new Date(query.to) : new Date();
    const from = query.from
      ? new Date(query.from)
      : new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
    const limit = query.limit ?? 100;

    const [items, total] = await Promise.all([
      this.pricingRepository.findHistory(symbol, karat, from, to, limit),
      this.pricingRepository.countHistory(symbol, karat, from, to),
    ]);

    return {
      symbol,
      karat,
      period: { from: from.toISOString(), to: to.toISOString() },
      total,
      items: items.map((item) => this.mapHistoryItem(item)),
    };
  }

  async getMargins(actor: AuthenticatedUser): Promise<PricingMarginsDto> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.pricing.configure);
    const config = await this.pricingConfigRepository.getOrCreateConfig();
    return this.mapMargins(config);
  }

  async updateMargins(
    dto: UpdatePricingMarginsDto,
    actor: AuthenticatedUser,
  ): Promise<PricingMarginsDto> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.pricing.configure);

    const config = await this.pricingConfigRepository.updateConfig({
      spreadPercent: dto.spreadPercent,
      tradeCommissionPercent: dto.tradeCommissionPercent,
      defaultMakingFeePercent: dto.defaultMakingFeePercent,
      refreshIntervalMs: dto.refreshIntervalMs,
      ...(dto.brsEnabled !== undefined ? { brsEnabled: dto.brsEnabled } : {}),
    });

    return this.mapMargins(config);
  }

  async getProviders(actor: AuthenticatedUser): Promise<PricingProvidersResponseDto> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.pricing.configure);

    const env = getApiEnv();
    const config = await this.pricingConfigRepository.getOrCreateConfig();
    const checkedAt = new Date().toISOString();

    let marketCache: PricingProvidersResponseDto['marketCache'] = null;
    try {
      const health = await this.marketHealth.getHealth();
      marketCache = {
        status: health.status,
        redis: health.redis,
        lastSyncAt: health.lastSyncAt,
        provider: health.provider,
      };
    } catch {
      marketCache = null;
    }

    const providers: PricingProvidersResponseDto['providers'] = [
      await this.probeProvider(
        'primary',
        config.primaryProviderName,
        'primary',
        config.brsEnabled && Boolean(env.BRS_API_KEY || env.GOLD_PRICE_PRIMARY_URL),
        async () => {
          await this.primaryProvider.fetchSpotQuote('XAU-IRR', 18);
        },
      ),
      await this.probeProvider(
        'fallback',
        config.fallbackProviderName,
        'fallback',
        true,
        async () => {
          await this.fallbackProvider.fetchSpotQuote('XAU-IRR', 18);
        },
      ),
      {
        key: 'market-cache',
        name: 'market-redis-cache',
        role: 'market',
        enabled: true,
        configured: true,
        status:
          marketCache?.status === 'ok'
            ? 'healthy'
            : marketCache?.status === 'degraded'
              ? 'degraded'
              : 'unknown',
        message: marketCache
          ? `Redis: ${marketCache.redis}, last sync: ${marketCache.lastSyncAt ?? '—'}`
          : 'Market health unavailable',
        lastCheckedAt: checkedAt,
      },
    ];

    return {
      providers,
      marketCache,
      env: {
        brsApiConfigured: Boolean(env.BRS_API_KEY),
        primaryUrlConfigured: Boolean(env.GOLD_PRICE_PRIMARY_URL),
        refreshIntervalMs: config.refreshIntervalMs,
      },
    };
  }

  async listOverrides(query: AdminOverridesQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.pricing.override);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await this.pricingConfigRepository.listOverrides(
      skip,
      limit,
      query.activeOnly,
    );

    return {
      page,
      limit,
      total,
      items: items.map((row) => this.mapOverride(row)),
    };
  }

  async createOverride(
    dto: UpsertGoldPriceOverrideDto,
    actor: AuthenticatedUser,
  ): Promise<GoldPriceOverrideDto> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.pricing.override);

    const row = await this.pricingConfigRepository.createOverride({
      symbol: dto.symbol ?? 'XAU-IRR',
      karat: dto.karat ?? 18,
      pricePerGram: dto.pricePerGram,
      buyPrice: dto.buyPrice,
      sellPrice: dto.sellPrice,
      reason: dto.reason,
      isActive: dto.isActive ?? true,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      createdBy: { connect: { id: actor.id } },
    });

    await this.pricingRepository.saveTick({
      symbol: row.symbol,
      karat: row.karat,
      pricePerGram: Number(row.pricePerGram),
      buyPrice: Number(row.buyPrice ?? row.pricePerGram),
      sellPrice: Number(row.sellPrice ?? row.pricePerGram),
      spreadPercent: 0,
      source: GoldPriceSource.MANUAL,
      providerName: 'manual-override',
      recordedAt: new Date(),
    });

    return this.mapOverride(row);
  }

  async updateOverride(
    id: string,
    dto: UpsertGoldPriceOverrideDto,
    actor: AuthenticatedUser,
  ): Promise<GoldPriceOverrideDto> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.pricing.override);

    const existing = await this.pricingConfigRepository.findOverrideById(id);
    if (!existing) {
      throw new NotFoundException('Price override not found');
    }

    const row = await this.pricingConfigRepository.updateOverride(id, {
      symbol: dto.symbol,
      karat: dto.karat,
      pricePerGram: dto.pricePerGram,
      buyPrice: dto.buyPrice,
      sellPrice: dto.sellPrice,
      reason: dto.reason,
      isActive: dto.isActive,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    });

    return this.mapOverride(row);
  }

  async deleteOverride(id: string, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.pricing.override);

    const existing = await this.pricingConfigRepository.findOverrideById(id);
    if (!existing) {
      throw new NotFoundException('Price override not found');
    }

    await this.pricingConfigRepository.deleteOverride(id);
    return { ok: true };
  }

  private async probeProvider(
    key: string,
    name: string,
    role: 'primary' | 'fallback',
    configured: boolean,
    probe: () => Promise<void>,
  ): Promise<PricingProvidersResponseDto['providers'][number]> {
    const checkedAt = new Date().toISOString();
    if (!configured) {
      return {
        key,
        name,
        role,
        enabled: false,
        configured: false,
        status: 'unknown',
        message: 'Not configured in environment',
        lastCheckedAt: checkedAt,
      };
    }

    try {
      await probe();
      return {
        key,
        name,
        role,
        enabled: true,
        configured: true,
        status: 'healthy',
        lastCheckedAt: checkedAt,
      };
    } catch (error) {
      return {
        key,
        name,
        role,
        enabled: true,
        configured: true,
        status: 'down',
        message: error instanceof Error ? error.message : 'Probe failed',
        lastCheckedAt: checkedAt,
      };
    }
  }

  private mapLive(price: EngineLiveDto): LiveGoldPriceDto {
    return {
      symbol: price.symbol,
      karat: price.karat,
      pricePerGram: price.pricePerGram,
      buyPrice: price.buyPrice,
      sellPrice: price.sellPrice,
      spreadPercent: price.spreadPercent,
      source: price.source,
      providerName: price.providerName,
      recordedAt: price.recordedAt,
    };
  }

  private mapHistoryItem(item: {
    id: string;
    pricePerGram: { toString(): string };
    buyPrice: { toString(): string };
    sellPrice: { toString(): string };
    source: string;
    providerName: string;
    recordedAt: Date;
  }): GoldPriceHistoryItemDto {
    return {
      id: item.id,
      pricePerGram: item.pricePerGram.toString(),
      buyPrice: item.buyPrice.toString(),
      sellPrice: item.sellPrice.toString(),
      source: item.source,
      providerName: item.providerName,
      recordedAt: item.recordedAt.toISOString(),
    };
  }

  private mapMargins(config: {
    spreadPercent: { toString(): string };
    tradeCommissionPercent: { toString(): string };
    defaultMakingFeePercent: number;
    refreshIntervalMs: number;
    primaryProviderName: string;
    fallbackProviderName: string;
    brsEnabled: boolean;
    updatedAt: Date;
  }): PricingMarginsDto {
    return {
      spreadPercent: Number(config.spreadPercent),
      tradeCommissionPercent: Number(config.tradeCommissionPercent),
      defaultMakingFeePercent: config.defaultMakingFeePercent,
      refreshIntervalMs: config.refreshIntervalMs,
      primaryProviderName: config.primaryProviderName,
      fallbackProviderName: config.fallbackProviderName,
      brsEnabled: config.brsEnabled,
      updatedAt: config.updatedAt.toISOString(),
    };
  }

  private mapOverride(row: {
    id: string;
    symbol: string;
    karat: number;
    pricePerGram: { toString(): string };
    buyPrice: { toString(): string } | null;
    sellPrice: { toString(): string } | null;
    reason: string | null;
    isActive: boolean;
    expiresAt: Date | null;
    createdBy: { id: string; email: string; fullName: string } | null;
    createdAt: Date;
    updatedAt: Date;
  }): GoldPriceOverrideDto {
    return {
      id: row.id,
      symbol: row.symbol,
      karat: row.karat,
      pricePerGram: row.pricePerGram.toString(),
      buyPrice: row.buyPrice?.toString() ?? null,
      sellPrice: row.sellPrice?.toString() ?? null,
      reason: row.reason,
      isActive: row.isActive,
      expiresAt: row.expiresAt?.toISOString() ?? null,
      createdBy: row.createdBy,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}

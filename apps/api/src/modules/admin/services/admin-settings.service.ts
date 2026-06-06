import { Injectable, OnModuleInit } from '@nestjs/common';
import { ADMIN_PERMISSIONS } from '@talashim/shared/admin-rbac';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { assertAdminPermission } from '@/common/rbac/assert-admin-permission';
import { setPlatformSettingsCache } from '@/common/platform-settings/platform-settings-runtime';
import { PricingConfigRepository } from '@/modules/pricing/repositories/pricing-config.repository';
import type { PatchPlatformSettingsDto } from '../dto/platform-settings.dto';
import type { PlatformSettingsPayload } from '../platform-settings.defaults';
import { PlatformSettingsRepository } from '../repositories/platform-settings.repository';
import { AdminRepository } from '../repositories/admin.repository';

@Injectable()
export class AdminSettingsService implements OnModuleInit {
  constructor(
    private readonly platformSettingsRepository: PlatformSettingsRepository,
    private readonly adminRepository: AdminRepository,
    private readonly pricingConfigRepository: PricingConfigRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.refreshRuntimeCache();
  }

  private async refreshRuntimeCache(): Promise<PlatformSettingsPayload> {
    const settings = await this.platformSettingsRepository.findOrCreate();
    setPlatformSettingsCache(settings);
    return settings;
  }

  private async syncGoldToPricing(gold: PlatformSettingsPayload['gold']): Promise<void> {
    await this.pricingConfigRepository.updateConfig({
      spreadPercent: gold.spreadPercent,
      tradeCommissionPercent: gold.tradeCommissionPercent,
      defaultMakingFeePercent: gold.defaultMakingFeePercent,
      refreshIntervalMs: gold.marketRefreshSeconds * 1000,
    });
  }

  async getSettings(actor: AuthenticatedUser): Promise<PlatformSettingsPayload> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.settings.read);
    return this.refreshRuntimeCache();
  }

  async patchSettings(
    payload: PatchPlatformSettingsDto,
    actor: AuthenticatedUser,
  ): Promise<PlatformSettingsPayload> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.settings.write);

    const updated = await this.platformSettingsRepository.upsert({
      ...(payload.general
        ? { general: payload.general as PlatformSettingsPayload['general'] }
        : {}),
      ...(payload.commerce
        ? { commerce: payload.commerce as PlatformSettingsPayload['commerce'] }
        : {}),
      ...(payload.gold ? { gold: payload.gold as PlatformSettingsPayload['gold'] } : {}),
      ...(payload.featureFlags
        ? { featureFlags: payload.featureFlags as PlatformSettingsPayload['featureFlags'] }
        : {}),
    });

    await this.adminRepository.createAuditLog('admin.settings.updated', actor.id, {
      sections: Object.keys(payload).filter(
        (key) => payload[key as keyof PatchPlatformSettingsDto] !== undefined,
      ),
    });

    setPlatformSettingsCache(updated);

    if (payload.gold) {
      await this.syncGoldToPricing(updated.gold);
    }

    return updated;
  }

  async getPublicSiteConfig() {
    const settings = await this.refreshRuntimeCache();
    return {
      maintenanceMode: settings.general.maintenanceMode,
      maintenanceMessage: settings.general.maintenanceMessage ?? null,
      general: {
        storeName: settings.general.storeName,
        tagline: settings.general.tagline ?? null,
        supportEmail: settings.general.supportEmail,
        supportPhone: settings.general.supportPhone,
        contactAddress: settings.general.contactAddress,
        businessHours: settings.general.businessHours,
      },
      commerce: settings.commerce,
      gold: settings.gold,
      featureFlags: settings.featureFlags,
      updatedAt: settings.updatedAt,
    };
  }

  async getPublicSiteStatus() {
    const settings = await this.refreshRuntimeCache();
    return {
      maintenanceMode: settings.general.maintenanceMode,
      maintenanceMessage: settings.general.maintenanceMessage ?? null,
      updatedAt: settings.updatedAt,
    };
  }
}

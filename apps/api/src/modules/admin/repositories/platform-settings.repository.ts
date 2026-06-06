import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import {
  DEFAULT_COMMERCE_SETTINGS,
  DEFAULT_FEATURE_FLAGS,
  DEFAULT_GENERAL_SETTINGS,
  DEFAULT_GOLD_SETTINGS,
  type PlatformSettingsPayload,
} from '../platform-settings.defaults';

@Injectable()
export class PlatformSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreate(): Promise<PlatformSettingsPayload> {
    const row = await this.prisma.platformSettings.findUnique({ where: { id: 'default' } });
    if (!row) {
      const created = await this.prisma.platformSettings.create({
        data: {
          id: 'default',
          general: DEFAULT_GENERAL_SETTINGS,
          commerce: DEFAULT_COMMERCE_SETTINGS,
          gold: DEFAULT_GOLD_SETTINGS,
          featureFlags: DEFAULT_FEATURE_FLAGS,
        },
      });
      return this.mapRow(created);
    }
    return this.mapRow(row);
  }

  async upsert(payload: {
    general?: PlatformSettingsPayload['general'];
    commerce?: PlatformSettingsPayload['commerce'];
    gold?: PlatformSettingsPayload['gold'];
    featureFlags?: PlatformSettingsPayload['featureFlags'];
  }): Promise<PlatformSettingsPayload> {
    const current = await this.findOrCreate();
    const row = await this.prisma.platformSettings.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        general: payload.general ?? current.general,
        commerce: payload.commerce ?? current.commerce,
        gold: payload.gold ?? current.gold,
        featureFlags: payload.featureFlags ?? current.featureFlags,
      },
      update: {
        ...(payload.general ? { general: payload.general } : {}),
        ...(payload.commerce ? { commerce: payload.commerce } : {}),
        ...(payload.gold ? { gold: payload.gold } : {}),
        ...(payload.featureFlags ? { featureFlags: payload.featureFlags } : {}),
      },
    });
    return this.mapRow(row);
  }

  private mapRow(row: {
    general: unknown;
    commerce: unknown;
    gold: unknown;
    featureFlags: unknown;
    updatedAt: Date;
  }): PlatformSettingsPayload {
    const general = row.general as PlatformSettingsPayload['general'];
    return {
      general: {
        ...general,
        maintenanceMode: general.maintenanceMode === true,
      },
      commerce: row.commerce as PlatformSettingsPayload['commerce'],
      gold: row.gold as PlatformSettingsPayload['gold'],
      featureFlags: row.featureFlags as PlatformSettingsPayload['featureFlags'],
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}

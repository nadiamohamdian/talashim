import {
  DEFAULT_PLATFORM_SETTINGS,
  type PlatformSettingsPayload,
} from '@/modules/admin/platform-settings.defaults';

let cache: PlatformSettingsPayload = DEFAULT_PLATFORM_SETTINGS;

export function setPlatformSettingsCache(settings: PlatformSettingsPayload): void {
  cache = settings;
}

export function getPlatformSettings(): PlatformSettingsPayload {
  return cache;
}

import { serverFetch } from '@/lib/api/client';
import type { StorefrontSettings } from '@/shared/model/storefront-settings';
import { DEFAULT_STOREFRONT_SETTINGS } from '@/features/site/lib/storefront-settings-defaults';

export type SiteStatus = Pick<
  StorefrontSettings,
  'maintenanceMode' | 'maintenanceMessage' | 'updatedAt'
>;

export function fetchSiteStatus() {
  return serverFetch<SiteStatus>('/site/status', { cache: 'no-store' });
}

export async function fetchSiteConfig(): Promise<StorefrontSettings> {
  try {
    return await serverFetch<StorefrontSettings>('/site/config', { cache: 'no-store' });
  } catch {
    return DEFAULT_STOREFRONT_SETTINGS;
  }
}

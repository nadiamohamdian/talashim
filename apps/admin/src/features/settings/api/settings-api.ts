import { axiosClient } from '@/shared/api/axios-client';
import type { PlatformSettings } from '../model/schemas';

export function fetchPlatformSettings() {
  return axiosClient.get<PlatformSettings>('/admin/settings').then((r) => r.data);
}

export function patchPlatformSettings(
  payload: Partial<
    Pick<PlatformSettings, 'general' | 'commerce' | 'gold' | 'featureFlags'>
  >,
) {
  return axiosClient.patch<PlatformSettings>('/admin/settings', payload).then((r) => r.data);
}

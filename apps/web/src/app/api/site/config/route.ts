import { fetchSiteConfig } from '@/lib/api/site.api';
import { DEFAULT_STOREFRONT_SETTINGS } from '@/features/site/lib/storefront-settings-defaults';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = await fetchSiteConfig();
  return Response.json(config ?? DEFAULT_STOREFRONT_SETTINGS, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

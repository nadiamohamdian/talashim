import { DEFAULT_STOREFRONT_SETTINGS } from '@/features/site/lib/storefront-settings-defaults';
import { fetchSiteStatus } from '@/lib/api/site.api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await fetchSiteStatus();
    return Response.json(status, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch {
    return Response.json(
      {
        maintenanceMode: DEFAULT_STOREFRONT_SETTINGS.maintenanceMode,
        maintenanceMessage: DEFAULT_STOREFRONT_SETTINGS.maintenanceMessage,
        updatedAt: DEFAULT_STOREFRONT_SETTINGS.updatedAt,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      },
    );
  }
}

import { Logger } from '@nestjs/common';
import { getApiEnv } from '@/config/env';

const logger = new Logger('StorefrontCache');

export async function revalidateStorefrontBanners(): Promise<void> {
  const env = getApiEnv();
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return;
  }

  const url = `${env.WEB_URL.replace(/\/$/, '')}/api/revalidate`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': secret,
      },
      body: JSON.stringify({ path: '/', tag: 'content:banners' }),
    });

    if (!response.ok) {
      logger.warn(`Storefront banner revalidation failed (${response.status})`);
    }
  } catch (error) {
    logger.warn(
      `Storefront banner revalidation error: ${error instanceof Error ? error.message : 'unknown'}`,
    );
  }
}

export async function revalidateStorefrontFaq(): Promise<void> {
  const env = getApiEnv();
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return;
  }

  const url = `${env.WEB_URL.replace(/\/$/, '')}/api/revalidate`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': secret,
      },
      body: JSON.stringify({ path: '/faq', tag: 'content:faq' }),
    });

    if (!response.ok) {
      logger.warn(`Storefront FAQ revalidation failed (${response.status})`);
    }
  } catch (error) {
    logger.warn(
      `Storefront FAQ revalidation error: ${error instanceof Error ? error.message : 'unknown'}`,
    );
  }
}

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

export async function revalidateStorefrontHomepage(): Promise<void> {
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
      body: JSON.stringify({ path: '/', tag: 'content:homepage' }),
    });

    if (!response.ok) {
      logger.warn(`Storefront homepage revalidation failed (${response.status})`);
    }
  } catch (error) {
    logger.warn(
      `Storefront homepage revalidation error: ${error instanceof Error ? error.message : 'unknown'}`,
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

    const homeResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': secret,
      },
      body: JSON.stringify({ path: '/', tag: 'content:faq' }),
    });

    if (!homeResponse.ok) {
      logger.warn(`Storefront homepage FAQ revalidation failed (${homeResponse.status})`);
    }
  } catch (error) {
    logger.warn(
      `Storefront FAQ revalidation error: ${error instanceof Error ? error.message : 'unknown'}`,
    );
  }
}

const ROOT_STATIC_PAGE_SLUGS = new Set(['about', 'terms', 'policies']);

function resolveStaticPagePath(slug: string): string {
  if (ROOT_STATIC_PAGE_SLUGS.has(slug)) {
    return `/${slug}`;
  }
  return `/pages/${slug}`;
}

export async function revalidateStorefrontStaticPages(
  ...slugs: Array<string | undefined>
): Promise<void> {
  const env = getApiEnv();
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return;
  }

  const uniqueSlugs = [...new Set(slugs.filter((slug): slug is string => Boolean(slug?.trim())))];
  if (uniqueSlugs.length === 0) {
    return;
  }

  const url = `${env.WEB_URL.replace(/\/$/, '')}/api/revalidate`;

  for (const slug of uniqueSlugs) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-revalidate-secret': secret,
        },
        body: JSON.stringify({
          path: resolveStaticPagePath(slug),
          tag: `content:static-page:${slug}`,
        }),
      });

      if (!response.ok) {
        logger.warn(`Storefront static page revalidation failed for ${slug} (${response.status})`);
      }
    } catch (error) {
      logger.warn(
        `Storefront static page revalidation error for ${slug}: ${error instanceof Error ? error.message : 'unknown'}`,
      );
    }
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': secret,
      },
      body: JSON.stringify({ tag: 'content:static-pages' }),
    });

    if (!response.ok) {
      logger.warn(`Storefront static pages list revalidation failed (${response.status})`);
    }
  } catch (error) {
    logger.warn(
      `Storefront static pages list revalidation error: ${error instanceof Error ? error.message : 'unknown'}`,
    );
  }
}

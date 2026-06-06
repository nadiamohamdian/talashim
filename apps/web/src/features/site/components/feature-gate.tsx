import type { ReactNode } from 'react';
import { fetchSiteConfig } from '@/lib/api/site.api';
import type { StorefrontFeatureFlags } from '@/shared/model/storefront-settings';
import { FeatureDisabledPage } from './feature-disabled-page';

const MESSAGES: Record<
  keyof Pick<
    StorefrontFeatureFlags,
    'enableGoldTrading' | 'enableBlog' | 'enableWishlist'
  >,
  { title: string; description: string }
> = {
  enableGoldTrading: {
    title: 'معاملات طلا غیرفعال است',
    description: 'این بخش توسط مدیر سیستم موقتاً غیرفعال شده است.',
  },
  enableBlog: {
    title: 'بخش محتوا غیرفعال است',
    description: 'وبلاگ و مقالات فعلاً در دسترس نیستند.',
  },
  enableWishlist: {
    title: 'لیست علاقه‌مندی غیرفعال است',
    description: 'این قابلیت توسط مدیر سیستم غیرفعال شده است.',
  },
};

export async function FeatureGate({
  flag,
  children,
}: {
  flag: keyof typeof MESSAGES;
  children: ReactNode;
}) {
  const config = await fetchSiteConfig();
  if (!config.featureFlags[flag]) {
    const message = MESSAGES[flag];
    return <FeatureDisabledPage title={message.title} description={message.description} />;
  }
  return children;
}

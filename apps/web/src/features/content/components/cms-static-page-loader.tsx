import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CmsStaticPageView } from '@/features/content/components/cms-static-page-view';
import { getPublishedStaticPage } from '@/lib/api/cms.api';

interface CmsStaticPageLoaderProps {
  slug: string;
}

export async function generateCmsStaticPageMetadata(slug: string): Promise<Metadata> {
  const page = await getPublishedStaticPage(slug);
  if (!page) {
    return { title: 'صفحه یافت نشد' };
  }

  return {
    title: page.metaTitle ?? page.title,
    description: page.metaDescription ?? undefined,
  };
}

export async function CmsStaticPageLoader({ slug }: CmsStaticPageLoaderProps) {
  const page = await getPublishedStaticPage(slug);
  if (!page) {
    notFound();
  }

  return <CmsStaticPageView page={page} />;
}

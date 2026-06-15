import type { Metadata } from 'next';
import { CmsStaticPageView } from '@/features/content/components/cms-static-page-view';
import { getPublishedStaticPage } from '@/lib/api/cms.api';
import { POLICIES_PAGE_META } from '@/shared/config/policies-page';
import { PoliciesPageView } from '@/widgets/policies/policies-page-view';

export const metadata: Metadata = {
  title: POLICIES_PAGE_META.title,
  description: POLICIES_PAGE_META.description,
};

export const dynamic = 'force-dynamic';

export default async function PoliciesPage() {
  const page = await getPublishedStaticPage('policies');

  if (page) {
    return <CmsStaticPageView page={page} />;
  }

  return <PoliciesPageView />;
}

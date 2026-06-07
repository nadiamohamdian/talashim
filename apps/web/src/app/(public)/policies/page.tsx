import type { Metadata } from 'next';
import {
  CmsStaticPageLoader,
  generateCmsStaticPageMetadata,
} from '@/features/content/components/cms-static-page-loader';

export async function generateMetadata(): Promise<Metadata> {
  return generateCmsStaticPageMetadata('policies');
}

export default function PoliciesPage() {
  return <CmsStaticPageLoader slug="policies" />;
}

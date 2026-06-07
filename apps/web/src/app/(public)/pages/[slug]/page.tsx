import type { Metadata } from 'next';
import {
  CmsStaticPageLoader,
  generateCmsStaticPageMetadata,
} from '@/features/content/components/cms-static-page-loader';

interface DynamicStaticPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: DynamicStaticPageProps): Promise<Metadata> {
  const { slug } = await params;
  return generateCmsStaticPageMetadata(slug);
}

export default async function DynamicStaticPage({ params }: DynamicStaticPageProps) {
  const { slug } = await params;
  return <CmsStaticPageLoader slug={slug} />;
}

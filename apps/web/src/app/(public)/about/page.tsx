import type { Metadata } from 'next';
import { getPublicAboutPage } from '@/lib/api/cms.api';
import { AboutPageView } from '@/widgets/about/about-page-view';

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublicAboutPage();

  return {
    title: content.meta.title,
    description: content.meta.description,
  };
}

export default async function AboutPage() {
  const content = await getPublicAboutPage();

  return <AboutPageView content={content} />;
}

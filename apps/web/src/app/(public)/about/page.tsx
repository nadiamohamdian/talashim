import type { Metadata } from 'next';
import { ABOUT_PAGE_META } from '@/shared/config/about-page';
import { AboutPageView } from '@/widgets/about/about-page-view';

export const metadata: Metadata = {
  title: ABOUT_PAGE_META.title,
  description: ABOUT_PAGE_META.description,
};

export default function AboutPage() {
  return <AboutPageView />;
}

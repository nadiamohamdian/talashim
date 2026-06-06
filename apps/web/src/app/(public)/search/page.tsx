import type { Metadata } from 'next';
import { PublicPageShell } from '@/widgets/content/public-page-shell';
import { SearchResults } from '@/widgets/catalog/search-results';

export const metadata: Metadata = {
  title: 'جستجو',
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '' } = await searchParams;

  return (
    <PublicPageShell
      eyebrow="فروشگاه"
      title="جستجوی محصولات"
      description="جستجو در کاتالوگ عمومی — خرید پس از ورود."
    >
      <SearchResults query={q} />
    </PublicPageShell>
  );
}

import { getPublicHomepage, getPublishedLensVideos } from '@/lib/api/cms.api';
import { CategoryShowcase } from '@/widgets/home/category-showcase';
import { BudgetShowcase } from '@/widgets/home/budget-showcase';
import { LensShowcase } from '@/widgets/home/lens-showcase';
import { BestsellersShowcase, NewArrivalsShowcase } from '@/widgets/home/new-arrivals-showcase';
import { WeddingPromoBanner } from '@/widgets/home/wedding-promo-banner';
import { PromoHero } from '@/widgets/home/promo-hero';

export default async function HomePage() {
  const [homepage, lensVideos] = await Promise.all([
    getPublicHomepage(),
    getPublishedLensVideos().catch(() => []),
  ]);

  return (
    <div className="home-page -mx-4 overflow-x-clip sm:-mx-6">
      <PromoHero hero={homepage.hero} />
      <div className="mx-4 hidden h-px bg-gradient-to-r from-transparent via-nude-200 to-transparent sm:mx-6 lg:block" />
      {homepage.sections.showCategoryShowcase ? <CategoryShowcase /> : null}
      {homepage.sections.showCategoryShowcase ? <BudgetShowcase /> : null}
      {homepage.sections.showCategoryShowcase ? <LensShowcase videos={lensVideos} /> : null}
      {homepage.sections.showCategoryShowcase ? <NewArrivalsShowcase /> : null}
      {homepage.sections.showCategoryShowcase ? <WeddingPromoBanner /> : null}
      {homepage.sections.showCategoryShowcase ? <BestsellersShowcase /> : null}
    </div>
  );
}

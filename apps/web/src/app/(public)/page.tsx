import { getPublicHomepage } from '@/lib/api/cms.api';
import { LENS_CAROUSEL_DEMO_ITEMS, LENS_SHOWCASE_DEMO_ITEMS } from '@/shared/config/lens-showcase-demo';
import { CategoryShowcase } from '@/widgets/home/category-showcase';
import { BudgetShowcase } from '@/widgets/home/budget-showcase';
import { LensSetsShowcase } from '@/widgets/home/lens-sets-showcase';
import { LensShowcase } from '@/widgets/home/lens-showcase';
import { HomeMagazineShowcase } from '@/widgets/home/home-magazine-showcase';
import { BestsellersShowcase, NewArrivalsShowcase } from '@/widgets/home/new-arrivals-showcase';
import { WeddingPromoBanner } from '@/widgets/home/wedding-promo-banner';
import { PromoHero } from '@/widgets/home/promo-hero';

export default async function HomePage() {
  const homepage = await getPublicHomepage();

  return (
    <div className="home-page store-chrome-dark -mx-4 overflow-x-clip sm:-mx-6">
      <PromoHero hero={homepage.hero} />
      <div className="mx-4 hidden h-px bg-gradient-to-r from-transparent via-nude-200 to-transparent sm:mx-6 lg:block" />
      {homepage.sections.showCategoryShowcase ? <CategoryShowcase /> : null}
      {homepage.sections.showCategoryShowcase ? <BudgetShowcase /> : null}
      {homepage.sections.showCategoryShowcase ? (
        <>
          <LensSetsShowcase items={LENS_SHOWCASE_DEMO_ITEMS} />
          <LensShowcase items={LENS_CAROUSEL_DEMO_ITEMS} />
        </>
      ) : null}
      {homepage.sections.showCategoryShowcase ? <NewArrivalsShowcase /> : null}
      {homepage.sections.showCategoryShowcase ? <WeddingPromoBanner /> : null}
      {homepage.sections.showCategoryShowcase ? <BestsellersShowcase /> : null}
      {homepage.sections.showCategoryShowcase ? <HomeMagazineShowcase /> : null}
    </div>
  );
}

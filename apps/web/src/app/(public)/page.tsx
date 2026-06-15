import { getPublicHomepage, getPublishedLensVideos } from '@/lib/api/cms.api';
import {
  resolveLensCarouselItems,
  resolveLensSetsShowcaseItems,
} from '@/shared/config/cms-lens-showcase';
import { CategoryShowcase } from '@/widgets/home/category-showcase';
import { BrandEditorialShowcase } from '@/widgets/home/brand-editorial-showcase';
import { BudgetShowcase } from '@/widgets/home/budget-showcase';
import { LensSetsShowcase } from '@/widgets/home/lens-sets-showcase';
import { LensShowcase } from '@/widgets/home/lens-showcase';
import { HomeMagazineShowcase } from '@/widgets/home/home-magazine-showcase';
import { BestsellersShowcase, NewArrivalsShowcase } from '@/widgets/home/new-arrivals-showcase';
import { WeddingPromoBanner } from '@/widgets/home/wedding-promo-banner';
import { PromoHero } from '@/widgets/home/promo-hero';

export default async function HomePage() {
  const [homepage, lensVideos] = await Promise.all([
    getPublicHomepage(),
    getPublishedLensVideos(),
  ]);

  const lensSetsItems = resolveLensSetsShowcaseItems(lensVideos);
  const lensCarouselItems = resolveLensCarouselItems(lensVideos);

  return (
    <>
      <div className="home-hero-fullscreen">
        <PromoHero
          hero={homepage.hero}
          carouselProducts={[
            ...(homepage.bestsellerProducts ?? []),
            ...(homepage.newArrivalsProducts ?? []),
          ]}
        />
      </div>
      <div className="home-page store-chrome-dark -mx-4 overflow-x-clip sm:-mx-6 lg:mx-0 lg:w-full">
      {homepage.sections.showCategoryShowcase ? (
        <CategoryShowcase sections={homepage.sections} />
      ) : null}
      {homepage.sections.showCategoryShowcase ? <BudgetShowcase /> : null}
      {homepage.sections.showCategoryShowcase ? (
        <BestsellersShowcase
          sections={homepage.sections}
          products={homepage.bestsellerProducts ?? []}
        />
      ) : null}
      {homepage.sections.showCategoryShowcase ? <BrandEditorialShowcase /> : null}
      {homepage.sections.showCategoryShowcase ? (
        <LensSetsShowcase items={lensSetsItems} />
      ) : null}
      {homepage.sections.showCategoryShowcase ? (
        <LensShowcase items={lensCarouselItems} />
      ) : null}
      {homepage.sections.showCategoryShowcase ? (
        <NewArrivalsShowcase
          sections={homepage.sections}
          products={homepage.newArrivalsProducts ?? []}
        />
      ) : null}
      {homepage.sections.showCategoryShowcase ? <WeddingPromoBanner /> : null}
      {homepage.sections.showCategoryShowcase ? <HomeMagazineShowcase /> : null}
    </div>
    </>
  );
}

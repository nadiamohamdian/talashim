import type { CmsHomepageSections, ProductSummary } from '@sadafgold/types';
import { resolveBestsellersShowcase } from '@/shared/config/cms-bestsellers-showcase';
import { resolveNewArrivalsShowcase } from '@/shared/config/cms-new-arrivals-showcase';
import { HomeProductCarousel } from '@/widgets/home/home-product-carousel';

interface BestsellersShowcaseProps {
  sections: Pick<CmsHomepageSections, 'bestsellerTitle'>;
  products: ProductSummary[];
}

interface NewArrivalsShowcaseProps {
  sections: Pick<CmsHomepageSections, 'newArrivalsTitle'>;
  products: ProductSummary[];
}

export function NewArrivalsShowcase({ sections, products }: NewArrivalsShowcaseProps) {
  const { title, items } = resolveNewArrivalsShowcase(sections, products);

  return (
    <HomeProductCarousel
      className="home-product-carousel--bestsellers home-product-carousel--new-arrivals"
      id="new-arrivals-title"
      title={title}
      items={items}
    />
  );
}

export function BestsellersShowcase({ sections, products }: BestsellersShowcaseProps) {
  const { title, items } = resolveBestsellersShowcase(sections, products);

  return (
    <HomeProductCarousel
      className="home-product-carousel--bestsellers"
      id="bestsellers-title"
      title={title}
      items={items}
    />
  );
}

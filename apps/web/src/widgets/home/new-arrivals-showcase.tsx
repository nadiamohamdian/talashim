import {
  HOME_BESTSELLERS_SHOWCASE,
  HOME_NEW_ARRIVALS_SHOWCASE,
} from '@/shared/config/storefront-ia';
import { HomeProductCarousel } from '@/widgets/home/home-product-carousel';

export function NewArrivalsShowcase() {
  return (
    <HomeProductCarousel
      id="new-arrivals-title"
      title="جدیدترین ها"
      watermark="New Arrivals"
      items={HOME_NEW_ARRIVALS_SHOWCASE}
    />
  );
}

export function BestsellersShowcase() {
  return (
    <HomeProductCarousel
      id="bestsellers-title"
      title="پرفروشترین ها"
      watermark="Best Sellers"
      items={HOME_BESTSELLERS_SHOWCASE}
    />
  );
}

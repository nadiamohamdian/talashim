import type { PublicCmsBanner } from '@sadafgold/types';
import { BannerCarousel } from '@/widgets/cms/banner-carousel';

interface CategoryBannerProps {
  banners: PublicCmsBanner[];
}

export function CategoryBanner({ banners }: CategoryBannerProps) {
  if (!banners.length) {
    return null;
  }

  return (
    <div className="mb-8">
      <BannerCarousel banners={banners} />
    </div>
  );
}

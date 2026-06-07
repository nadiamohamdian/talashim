import { getPublishedBanners } from '@/lib/api/cms.api';
import { getBestsellerProducts, getFeaturedProducts } from '@/lib/api/product.api';
import { BannerCarousel } from '@/widgets/cms/banner-carousel';
import { CategoryShowcase } from '@/widgets/home/category-showcase';
import { ProductShowcase } from '@/widgets/home/product-showcase';
import { PromoHero } from '@/widgets/home/promo-hero';

export default async function HomePage() {
  const [products, bestsellers, heroBanners, midBanners] = await Promise.all([
    getFeaturedProducts().catch(() => []),
    getBestsellerProducts().catch(() => []),
    getPublishedBanners('HOME_HERO').catch(() => []),
    getPublishedBanners('HOME_MID').catch(() => []),
  ]);

  return (
    <div className="-mx-4 sm:-mx-6">
      <PromoHero banner={heroBanners[0] ?? null} />
      {midBanners.length > 0 ? (
        <div className="container-store py-8">
          <BannerCarousel banners={midBanners} />
        </div>
      ) : null}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-nude-200 to-transparent sm:mx-6" />
      <CategoryShowcase />
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-nude-200 to-transparent sm:mx-6" />
      <ProductShowcase
        title="جدیدترین محصولات"
        subtitle="آخرین طراحی‌های طلا و جواهر"
        products={products}
      />
      <ProductShowcase
        title="پرفروش‌ترین محصولات"
        subtitle="بر اساس تعداد فروش واقعی"
        products={bestsellers}
      />
    </div>
  );
}

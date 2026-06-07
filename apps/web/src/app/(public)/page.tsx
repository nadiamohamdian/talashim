import { getPublicHomepage, getPublishedBanners } from '@/lib/api/cms.api';
import { getBestsellerProducts, getFeaturedProducts } from '@/lib/api/product.api';
import { fetchSiteConfig } from '@/lib/api/site.api';
import { getFaqPosts } from '@/shared/api/blog-api';
import { BannerCarousel } from '@/widgets/cms/banner-carousel';
import { CategoryShowcase } from '@/widgets/home/category-showcase';
import { HomeFaqSection } from '@/widgets/home/faq-section';
import { ProductShowcase } from '@/widgets/home/product-showcase';
import { PromoHero } from '@/widgets/home/promo-hero';

export default async function HomePage() {
  const config = await fetchSiteConfig();
  const [products, bestsellers, homepage, midBanners, faqPosts] = await Promise.all([
    getFeaturedProducts().catch(() => []),
    getBestsellerProducts().catch(() => []),
    getPublicHomepage(),
    getPublishedBanners('HOME_MID').catch(() => []),
    config.featureFlags.enableBlog ? getFaqPosts(5).catch(() => []) : Promise.resolve([]),
  ]);

  return (
    <div className="-mx-4 sm:-mx-6">
      <PromoHero hero={homepage.hero} />
      {midBanners.length > 0 ? (
        <div className="container-store py-8">
          <BannerCarousel banners={midBanners} />
        </div>
      ) : null}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-nude-200 to-transparent sm:mx-6" />
      {homepage.sections.showCategoryShowcase ? <CategoryShowcase /> : null}
      {homepage.sections.showCategoryShowcase ? (
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-nude-200 to-transparent sm:mx-6" />
      ) : null}
      <ProductShowcase
        title={homepage.sections.featuredTitle}
        subtitle={homepage.sections.featuredSubtitle}
        products={products}
      />
      <ProductShowcase
        title={homepage.sections.bestsellerTitle}
        subtitle={homepage.sections.bestsellerSubtitle}
        products={bestsellers}
      />
      {faqPosts.length > 0 ? (
        <>
          <div className="mx-4 h-px bg-gradient-to-r from-transparent via-nude-200 to-transparent sm:mx-6" />
          <HomeFaqSection posts={faqPosts} />
        </>
      ) : null}
    </div>
  );
}

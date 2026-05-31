import { getGoldPrices } from '@/lib/api/gold.api';
import { getBestsellerProducts, getFeaturedProducts } from '@/lib/api/product.api';
import { CategoryShowcase } from '@/widgets/home/category-showcase';
import { ProductShowcase } from '@/widgets/home/product-showcase';
import { PromoHero } from '@/widgets/home/promo-hero';

export default async function HomePage() {
  const [products, bestsellers, prices] = await Promise.all([
    getFeaturedProducts(),
    getBestsellerProducts(),
    getGoldPrices(),
  ]);

  console.log('Gold Prices:', prices);

  return (
    <div className="-mx-4 sm:-mx-6">
      <pre className="container-store mb-4 overflow-x-auto rounded-lg border border-nude-200 bg-nude-50 p-4 text-xs text-foreground">
        {JSON.stringify(prices, null, 2)}
      </pre>
      <PromoHero />
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

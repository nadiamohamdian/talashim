import type { Metadata } from 'next';
import { getPublishedBanners } from '@/lib/api/cms.api';
import { getProducts } from '@/shared/api/catalog-api';
import { CategoryBanner } from '@/widgets/cms/category-banner';
import { ProductCard } from '@/widgets/catalog/product-card';
import { PublicPageShell } from '@/widgets/content/public-page-shell';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

const CATEGORY_MAP: Record<string, string> = {
  ring: 'ring',
  rings: 'ring',
  necklace: 'necklace',
  necklaces: 'necklace',
  bracelet: 'bracelet',
  bracelets: 'bracelet',
  coin: 'coin',
  coins: 'coin',
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: `دسته ${slug}` };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = CATEGORY_MAP[slug.toLowerCase()];
  const [products, categoryBanners] = await Promise.all([
    category ? getProducts(24, category) : Promise.resolve([]),
    getPublishedBanners('CATEGORY_TOP').catch(() => []),
  ]);

  return (
    <PublicPageShell
      eyebrow="دسته‌بندی"
      title={`محصولات ${slug}`}
      description="لیست محصولات این دسته — دسترسی عمومی."
    >
      <CategoryBanner banners={categoryBanners} />
      {!category ? (
        <p className="text-sm text-muted">دسته‌بندی یافت نشد.</p>
      ) : !products.length ? (
        <p className="text-sm text-muted">محصولی در این دسته موجود نیست.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </PublicPageShell>
  );
}

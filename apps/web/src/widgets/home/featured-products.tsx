import Link from 'next/link';
import { Badge } from '@sadafgold/ui';
import type { ProductSummary } from '@sadafgold/types';
import { ProductCard } from '@/widgets/catalog/product-card';

interface FeaturedProductsProps {
  products: ProductSummary[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Badge>منتخب هفته</Badge>
          <h2 className="mt-3 text-2xl font-bold text-stone-950">محصولات ویژه</h2>
        </div>
        <p className="text-sm text-stone-500">{products.length} محصول منتخب</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <div className="text-center">
        <Link href="/products" className="btn-nude inline-flex px-6 py-2.5 text-sm">
          مشاهده همه محصولات
        </Link>
      </div>
    </section>
  );
}

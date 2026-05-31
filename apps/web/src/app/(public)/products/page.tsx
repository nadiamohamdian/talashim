import type { Metadata } from 'next';
import { getProducts } from '@/shared/api/catalog-api';
import { ProductCard } from '@/widgets/catalog/product-card';

export const metadata: Metadata = {
  title: 'فروشگاه | گالری طلای صدف',
  description: 'فهرست محصولات طلا و جواهر',
};

export default async function ProductsPage() {
  const products = await getProducts(24);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-nude-200 bg-gradient-to-l from-nude-50 to-card p-6 md:p-8">
        <h1 className="section-heading">فروشگاه</h1>
        <p className="mt-3 text-sm text-muted">
          {products.length} محصول — افزودن به سبد بدون نیاز به ورود
        </p>
      </div>
      {!products.length ? (
        <p className="text-sm text-muted">محصولی یافت نشد.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

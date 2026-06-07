import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import { getProducts, getSaleProducts } from '@/shared/api/catalog-api';
import { ProductCard } from '@/widgets/catalog/product-card';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ sale?: string }>;
}): Promise<Metadata> {
  const { sale } = await searchParams;
  const onSale = sale === '1';

  return {
    title: onSale ? 'تخفیف‌های روز' : 'فروشگاه',
    description: onSale
      ? 'محصولات طلا و جواهر با تخفیف فعال'
      : 'فهرست محصولات طلا و جواهر',
  };
}

interface ProductsPageProps {
  searchParams: Promise<{ sale?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { sale } = await searchParams;
  const onSale = sale === '1';
  if (onSale) {
    noStore();
  }
  let products: Awaited<ReturnType<typeof getProducts>> = [];
  try {
    products = onSale ? await getSaleProducts(48) : await getProducts(24, undefined, false);
  } catch {
    products = [];
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-nude-200 bg-gradient-to-l from-nude-50 to-card p-6 md:p-8">
        <h1 className="section-heading">{onSale ? 'تخفیف‌های روز' : 'فروشگاه'}</h1>
        <p className="mt-3 text-sm text-muted">
          {products.length} محصول
          {onSale ? ' با تخفیف فعال' : ' — افزودن به سبد بدون نیاز به ورود'}
        </p>
      </div>
      {!products.length ? (
        <p className="text-sm text-muted">
          {onSale ? 'در حال حاضر محصول تخفیف‌دار موجود نیست.' : 'محصولی یافت نشد.'}
        </p>
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

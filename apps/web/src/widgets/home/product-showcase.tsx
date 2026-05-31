import Link from 'next/link';
import type { ProductSummary } from '@sadafgold/types';
import { ProductCard } from '@/widgets/catalog/product-card';

interface ProductShowcaseProps {
  title: string;
  subtitle?: string;
  products: ProductSummary[];
  viewAllHref?: string;
}

export function ProductShowcase({
  title,
  subtitle,
  products,
  viewAllHref = '/products',
}: ProductShowcaseProps) {
  return (
    <section className="container-store py-10 md:py-12">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="section-heading">{title}</h2>
          {subtitle ? <p className="mt-3 text-sm text-muted">{subtitle}</p> : null}
        </div>
        <Link href={viewAllHref} className="link-gold shrink-0 text-sm">
          مشاهده همه ←
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

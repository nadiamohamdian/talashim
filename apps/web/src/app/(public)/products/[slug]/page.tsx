import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StoreImage } from '@/shared/ui/store-image';
import { getProductBySlug } from '@/shared/api/catalog-api';
import { ProductDetailTabs } from '@/widgets/catalog/product-detail-tabs';
import { ProductPurchaseBox } from '@/widgets/catalog/product-purchase-box';
import { ProductSpecsPanel } from '@/widgets/catalog/product-specs-panel';
import { ProductTrustBadges } from '@/widgets/catalog/product-trust-badges';

interface ProductDetailsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: 'محصول | Sadaf Gold' };
  }
  return {
    title: `${product.title} | Sadaf Gold`,
    description: product.description,
  };
}

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <nav className="text-xs text-muted">
        <Link href="/" className="hover:text-gold-dark">
          صفحه اصلی
        </Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-gold-dark">
          محصولات
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="space-y-6">
          <div className="card-luxury overflow-hidden p-4 md:p-6">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-nude-50">
              <StoreImage
                src={product.imageUrl}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />
            </div>
          </div>

          <div className="card-luxury p-5 md:p-6 lg:hidden">
            <ProductSpecsPanel product={product} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-luxury p-5 md:p-6">
            <span className="badge-gold">{product.karat} عیار</span>
            <h1 className="mt-3 text-2xl font-bold leading-10 text-foreground md:text-3xl">
              {product.title}
            </h1>
            <div className="mt-4 hidden lg:block">
              <ProductSpecsPanel product={product} />
            </div>
          </div>

          <ProductPurchaseBox product={product} />
        </div>
      </div>

      <ProductTrustBadges />
      <ProductDetailTabs product={product} />
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/shared/api/catalog-api';
import { ProductDetailTabs } from '@/widgets/catalog/product-detail-tabs';
import { ProductDetailView } from '@/widgets/catalog/product-detail-view';
import { ProductTrustBadges } from '@/widgets/catalog/product-trust-badges';

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
interface ProductDetailsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: 'محصول | طلاشیم' };
  }

  const title = product.seoTitle?.trim() || product.title;
  const description = (
    product.seoDescription?.trim() ||
    stripHtml(product.description)
  ).slice(0, 160);
  const keywords = product.seoKeywords
    ?.split(/[,،]/)
    .map((k) => k.trim())
    .filter(Boolean);
  const ogImage = product.ogImageUrl || product.imageUrl;
  const canonical = product.seoCanonicalPath || `/products/${product.slug}`;

  return {
    title: `${title} | طلاشیم`,
    description,
    keywords,
    alternates: { canonical },
    robots: product.seoNoIndex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
      type: 'website',
      locale: 'fa_IR',
    },
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

      <ProductDetailView product={product} />

      <ProductTrustBadges />
      <ProductDetailTabs product={product} />
    </div>
  );
}

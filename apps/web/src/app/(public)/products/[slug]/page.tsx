import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/shared/api/catalog-api';
import {
  enrichProductDetailProps,
  resolveProductDetailDemo,
} from '@/shared/config/product-detail-demo';
import { ProductDetailTabs } from '@/widgets/catalog/product-detail-tabs';
import { ProductDetailMobile } from '@/widgets/catalog/product-detail-mobile';
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
  const demo = resolveProductDetailDemo(slug);
  const product = demo ?? (await getProductBySlug(slug));
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
  const demo = resolveProductDetailDemo(slug);
  const product = demo ?? (await getProductBySlug(slug));
  if (!product) {
    notFound();
  }

  const mobileProps = enrichProductDetailProps(product, demo);

  return (
    <div className="product-detail-page">
      <div className="product-detail-mobile-shell lg:hidden">
        <ProductDetailMobile {...mobileProps} />
      </div>

      <div className="product-detail-page-desktop hidden space-y-8 px-4 py-6 sm:px-6 md:py-10 lg:block">
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
    </div>
  );
}

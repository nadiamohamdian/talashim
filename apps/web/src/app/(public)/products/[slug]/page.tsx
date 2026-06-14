import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/shared/api/catalog-api';
import {
  enrichProductDetailProps,
  resolveProductDetailDemo,
} from '@/shared/config/product-detail-demo';
import { ProductDetailMobile } from '@/widgets/catalog/product-detail-mobile';

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
    <div className="product-detail-page store-chrome-dark">
      <div className="product-detail-mobile-shell">
        <ProductDetailMobile {...mobileProps} />
      </div>
    </div>
  );
}

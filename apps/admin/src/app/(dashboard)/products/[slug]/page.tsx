import { ProductDetailPanel } from '@/features/commerce/components/product-detail-panel';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <ProductDetailPanel slug={slug} />;
}

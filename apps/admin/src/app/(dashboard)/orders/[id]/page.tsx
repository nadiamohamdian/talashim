import { OrderDetailPanel } from '@/features/commerce/components/order-detail-panel';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <OrderDetailPanel orderId={id} />;
}

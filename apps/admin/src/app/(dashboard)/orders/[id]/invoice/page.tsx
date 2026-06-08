import { OrderInvoicePanel } from '@/features/commerce/components/order-invoice-panel';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <OrderInvoicePanel orderId={id} />;
}

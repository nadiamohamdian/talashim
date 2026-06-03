import { AccountShell } from '@/widgets/account/account-shell';
import { OrderDetailContent } from '@/features/account/components/order-detail-content';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <AccountShell
      title="جزئیات سفارش"
      description="وضعیت پرداخت و اقلام سفارش."
      returnPath="/orders"
    >
      <OrderDetailContent orderId={id} />
    </AccountShell>
  );
}

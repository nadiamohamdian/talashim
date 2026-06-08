import { AccountShell } from '@/widgets/account/account-shell';
import { OrderInvoiceContent } from '@/features/account/components/order-invoice-content';

interface OrderInvoicePageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderInvoicePage({ params }: OrderInvoicePageProps) {
  const { id } = await params;

  return (
    <AccountShell
      title="فاکتور سفارش"
      description="مشاهده و چاپ فاکتور رسمی سفارش تأییدشده."
      returnPath={`/orders/${id}/invoice`}
    >
      <OrderInvoiceContent orderId={id} />
    </AccountShell>
  );
}

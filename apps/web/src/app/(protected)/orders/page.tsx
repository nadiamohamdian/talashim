import { AccountShell } from '@/widgets/account/account-shell';
import { OrdersContent } from '@/features/account/components/orders-content';

export default function OrdersPage() {
  return (
    <AccountShell title="سفارش ها" returnPath="/orders" pageClassName="account-page--orders">
      <OrdersContent />
    </AccountShell>
  );
}

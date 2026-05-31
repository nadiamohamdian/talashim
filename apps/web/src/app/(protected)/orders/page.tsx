import { AccountShell } from '@/widgets/account/account-shell';
import { OrdersContent } from '@/features/account/components/orders-content';

export default function OrdersPage() {
  return (
    <AccountShell title="سفارش‌ها" description="تاریخچه سفارش‌های خرده‌فروشی." returnPath="/orders">
      <OrdersContent />
    </AccountShell>
  );
}

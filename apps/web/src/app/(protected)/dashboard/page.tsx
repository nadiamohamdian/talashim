import { AccountShell } from '@/widgets/account/account-shell';
import { DashboardContent } from '@/features/account/components/dashboard-content';

export default function DashboardPage() {
  return (
    <AccountShell
      title="پیشخوان"
      description="نمای کلی حساب، سفارش‌ها و دارایی‌ها."
      returnPath="/dashboard"
    >
      <DashboardContent />
    </AccountShell>
  );
}

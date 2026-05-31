import { AccountShell } from '@/widgets/account/account-shell';
import { InvoicesContent } from '@/features/account/components/invoices-content';

export default function InvoicesPage() {
  return (
    <AccountShell title="دانلودها" description="فاکتورها و فایل‌های قابل دانلود." returnPath="/invoices">
      <InvoicesContent />
    </AccountShell>
  );
}

import { AccountShell } from '@/widgets/account/account-shell';
import { InvoicesContent } from '@/features/account/components/invoices-content';

export default function InvoicesPage() {
  return (
    <AccountShell title="فاکتورها" description="فاکتورهای رسمی سفارش‌های تأییدشده." returnPath="/invoices">
      <InvoicesContent />
    </AccountShell>
  );
}

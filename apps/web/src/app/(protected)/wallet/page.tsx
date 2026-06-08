import { AccountShell } from '@/widgets/account/account-shell';
import { WalletPageContent } from '@/features/account/components/wallet-checkout-content';

export default function WalletPage() {
  return (
    <AccountShell
      title="کیف پول"
      description="مدیریت موجودی تومانی و طلا، واریز کارت‌به‌کارت و پیگیری تراکنش‌ها."
      returnPath="/wallet"
    >
      <WalletPageContent />
    </AccountShell>
  );
}

import { AccountShell } from '@/widgets/account/account-shell';
import { WalletPageContent } from '@/features/account/components/wallet-checkout-content';

export default function WalletPage() {
  return (
    <AccountShell
      title="کیف پول"
      description="واریز، برداشت و مشاهده موجودی ریال و طلا."
      returnPath="/wallet"
    >
      <WalletPageContent />
    </AccountShell>
  );
}

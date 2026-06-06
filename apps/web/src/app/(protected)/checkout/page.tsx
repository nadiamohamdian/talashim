import { ProtectedPageShell } from '@/widgets/content/protected-page-shell';
import { CheckoutContent } from '@/features/checkout/components/checkout-content';

export default function CheckoutPage() {
  return (
    <ProtectedPageShell
      title="تسویه حساب"
      description="تکمیل خرید — نیاز به احراز هویت."
    >
      <CheckoutContent />
    </ProtectedPageShell>
  );
}

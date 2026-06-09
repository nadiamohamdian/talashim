import { ProtectedShell } from '@/features/auth/components/protected-shell';
import { CheckoutPaymentView } from '@/widgets/checkout/checkout-payment-view';

export default function CheckoutPaymentPage() {
  return (
    <ProtectedShell>
      <CheckoutPaymentView />
    </ProtectedShell>
  );
}

import { ProtectedShell } from '@/features/auth/components/protected-shell';
import { CheckoutShippingView } from '@/widgets/checkout/checkout-shipping-view';

export default function CheckoutPage() {
  return (
    <ProtectedShell>
      <CheckoutShippingView />
    </ProtectedShell>
  );
}

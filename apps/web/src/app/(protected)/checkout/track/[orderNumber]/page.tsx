import { ProtectedShell } from '@/features/auth/components/protected-shell';
import { CheckoutTrackingView } from '@/widgets/checkout/checkout-tracking-view';

interface CheckoutTrackPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function CheckoutTrackPage({ params }: CheckoutTrackPageProps) {
  const { orderNumber } = await params;
  return (
    <ProtectedShell>
      <CheckoutTrackingView orderNumber={orderNumber} />
    </ProtectedShell>
  );
}

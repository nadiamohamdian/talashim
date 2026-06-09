import { Suspense } from 'react';
import { ProtectedShell } from '@/features/auth/components/protected-shell';
import { CheckoutConfirmationView } from '@/widgets/checkout/checkout-confirmation-view';

export default function CheckoutConfirmationPage() {
  return (
    <ProtectedShell>
      <Suspense
        fallback={
          <div className="checkout-page store-minimal-header">
            <div className="checkout-page-inner">
              <p className="checkout-empty">در حال بارگذاری...</p>
            </div>
          </div>
        }
      >
        <CheckoutConfirmationView />
      </Suspense>
    </ProtectedShell>
  );
}

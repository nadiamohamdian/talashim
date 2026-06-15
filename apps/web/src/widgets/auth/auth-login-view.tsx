import { Suspense } from 'react';
import { LoginSessionGuard } from '@/features/auth/components/login-session-guard';
import { LoginForm } from '@/features/auth/components/login-form';
import { AuthPageShell } from '@/widgets/auth/auth-page-shell';

interface AuthLoginViewProps {
  next?: string | null;
}

export function AuthLoginView({ next }: AuthLoginViewProps) {
  return (
    <AuthPageShell showSignupFooter>
      <Suspense fallback={<p className="auth-loading">در حال بارگذاری...</p>}>
        <LoginSessionGuard>
          <LoginForm next={next ?? null} />
        </LoginSessionGuard>
      </Suspense>
    </AuthPageShell>
  );
}

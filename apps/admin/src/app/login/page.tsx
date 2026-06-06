import { AdminLoginForm } from '@/features/auth/components/admin-login-form';
import { AdminStoreHeader } from '@/widgets/admin/admin-store-header';

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AdminStoreHeader />
      <main className="relative flex flex-1 items-center justify-center px-4 py-12">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 0%, color-mix(in srgb, var(--primary) 12%, var(--background)) 0%, var(--background) 65%)',
          }}
        />
        <AdminLoginForm />
      </main>
    </div>
  );
}

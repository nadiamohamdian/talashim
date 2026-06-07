import { AdminLoginForm } from '@/features/auth/components/admin-login-form';
import { AdminStoreHeader } from '@/widgets/admin/admin-store-header';

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AdminStoreHeader />
      <main className="relative flex flex-1 items-center justify-center px-4 py-10">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 75% 55% at 50% 0%, color-mix(in srgb, var(--primary) 10%, var(--background)) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 80%, color-mix(in srgb, var(--success) 4%, transparent) 0%, transparent 50%)',
          }}
        />
        <AdminLoginForm />
      </main>
    </div>
  );
}

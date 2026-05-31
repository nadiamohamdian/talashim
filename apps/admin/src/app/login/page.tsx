import { AdminLoginForm } from '@/features/auth/components/admin-login-form';
import { AdminStoreHeader } from '@/widgets/admin/admin-store-header';

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AdminStoreHeader />
      <main className="relative flex flex-1 items-center justify-center px-4 py-10">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 0%, var(--nude-100) 0%, #ffffff 70%)',
          }}
        />
        <AdminLoginForm />
      </main>
    </div>
  );
}

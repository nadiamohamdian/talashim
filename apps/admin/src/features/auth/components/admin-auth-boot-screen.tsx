import { adminEnv } from '@/shared/config/env';

/**
 * Shown while auth store hydrates or before redirect — same markup on server and client.
 */
export function AdminAuthBootScreen() {
  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden bg-white"
      aria-busy="true"
      aria-live="polite"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 90% 60% at 50% -10%, var(--nude-100) 0%, #ffffff 65%)',
        }}
      />
      <div
        className="pointer-events-none absolute -left-24 top-32 h-56 w-56 rounded-full bg-gold-light/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-nude-200/40 blur-3xl"
        aria-hidden
      />

      <header className="header-glass border-b border-border">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-amber-800">
              Talashim
            </span>
            <span className="text-sm font-bold text-stone-900">
              {adminEnv.NEXT_PUBLIC_ADMIN_APP_NAME}
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="card-luxury w-full max-w-sm border-gold-light/40 bg-white/90 p-8 text-center shadow-sm backdrop-blur-sm">
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-light/50 to-nude-100 ring-1 ring-gold-light/60"
            aria-hidden
          >
            <svg
              className="h-7 w-7 animate-spin text-gold-dark"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-90"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
              />
            </svg>
          </div>

          <p className="mt-6 text-base font-semibold text-stone-900">در حال بارگذاری پنل</p>
          <p className="mt-2 text-sm leading-7 text-stone-500">
            اتصال به سرویس‌ها و آماده‌سازی محیط مدیریت Talashim
          </p>

          <div className="mt-6 flex justify-center gap-1.5" aria-hidden>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-dark/80 [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-dark/60 [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-dark/40 [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    </div>
  );
}

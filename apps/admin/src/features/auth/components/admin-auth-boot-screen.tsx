import { adminEnv } from '@/shared/config/env';

/**
 * Shown while auth store hydrates or before redirect — same markup on server and client.
 */
export function AdminAuthBootScreen() {
  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden bg-background"
      aria-busy="true"
      aria-live="polite"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, color-mix(in srgb, var(--primary) 8%, var(--background)) 0%, var(--background) 70%)',
        }}
      />

      <header className="header-glass">
        <div
          className="mx-auto flex items-center justify-between px-4 sm:px-6"
          style={{ height: 'var(--header-height)' }}
        >
          <div className="flex flex-col leading-none">
            <span className="text-overline text-[var(--primary)]">Talashim</span>
            <span className="mt-1 text-sm font-semibold text-foreground">
              {adminEnv.NEXT_PUBLIC_ADMIN_APP_NAME}
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="card-luxury w-full max-w-sm p-8 text-center">
          <div
            className="mx-auto flex size-12 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--surface)]"
            aria-hidden
          >
            <svg
              className="size-5 animate-spin text-[var(--primary)]"
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

          <p className="mt-5 text-sm font-semibold text-foreground">در حال بارگذاری پنل</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            اتصال به سرویس‌ها و آماده‌سازی پنل مدیریت طلاشیم
          </p>

          <div className="mt-5 flex justify-center gap-1.5" aria-hidden>
            <span className="size-1.5 animate-pulse-subtle rounded-full bg-[var(--primary)] [animation-delay:0ms]" />
            <span className="size-1.5 animate-pulse-subtle rounded-full bg-[var(--primary)]/70 [animation-delay:150ms]" />
            <span className="size-1.5 animate-pulse-subtle rounded-full bg-[var(--primary)]/40 [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    </div>
  );
}

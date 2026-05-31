/**
 * Shown while auth store hydrates or before redirect — same markup on server and client.
 */
export function AdminAuthBootScreen() {
  return (
    <div className="flex min-h-screen flex-col bg-white" aria-busy="true" aria-live="polite">
      <div className="header-glass flex h-14 items-center justify-between px-4 sm:px-6">
        <span className="text-sm font-semibold tracking-wide text-gold-dark">SADAF GOLD</span>
      </div>
      <div className="flex flex-1 items-center justify-center bg-white">
        <p className="text-sm text-stone-500">در حال بارگذاری پنل…</p>
      </div>
    </div>
  );
}

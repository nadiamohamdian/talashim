import { platformConfig } from '@sadafgold/shared';

type MaintenancePageProps = {
  storeName?: string;
  message?: string | null;
};

export function MaintenancePage({ storeName, message }: MaintenancePageProps) {
  const displayMessage =
    message?.trim() ||
    'فروشگاه موقتاً در حال به‌روزرسانی است. به زودی بازمی‌گردیم.';

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-gradient-to-b from-nude-50 to-background px-6 py-16 text-center">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {platformConfig.nameEn}
        </p>
        <h1 className="mt-3 text-2xl font-bold text-foreground">
          {storeName ?? platformConfig.storeName}
        </h1>
        <p className="mt-6 text-sm leading-7 text-muted">{displayMessage}</p>
        <p className="mt-8 text-xs text-muted">
          پنل مدیریت و تیم داخلی همچنان در دسترس است.
        </p>
      </div>
    </div>
  );
}

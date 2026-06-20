interface PlaceholderPanelProps {
  template: 'detail' | 'settings';
  moduleLabel: string;
}

export function PlaceholderPanel({ template, moduleLabel }: PlaceholderPanelProps) {
  return (
    <div className="card-luxury p-6">
      <p className="text-overline">{template === 'detail' ? 'جزئیات' : 'تنظیمات'}</p>
      <h2 className="mt-2 text-lg font-semibold text-[var(--foreground)]">{moduleLabel}</h2>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
        این بخش هنوز پیاده‌سازی نشده است. محتوای نهایی در مرحله بعد اضافه می‌شود.
      </p>
    </div>
  );
}

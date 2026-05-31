const TRUST_ITEMS = [
  { title: 'تحویل اکسپرس', icon: '🚚' },
  { title: 'پرداخت امن', icon: '🔒' },
  { title: 'ضمانت اصالت کالا', icon: '✓' },
  { title: '۷ روز گارانتی بازگشت وجه', icon: '↩' },
] as const;

export function ProductTrustBadges() {
  return (
    <section className="grid grid-cols-2 gap-3 rounded-2xl border border-nude-200 bg-white p-4 md:grid-cols-4 md:gap-4 md:p-6">
      {TRUST_ITEMS.map((item) => (
        <div
          key={item.title}
          className="flex flex-col items-center gap-2 text-center text-xs text-muted md:text-sm"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-nude-50 text-lg">
            {item.icon}
          </span>
          <span className="font-medium text-foreground">{item.title}</span>
        </div>
      ))}
    </section>
  );
}

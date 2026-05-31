import type { AdminPageTemplate } from '@/shared/config/admin-routes';

interface PlaceholderPanelProps {
  template: AdminPageTemplate;
  moduleLabel: string;
}

const templateHint: Record<AdminPageTemplate, string> = {
  dashboard: 'کارت‌های KPI و نمودارها در این ناحیه قرار می‌گیرند.',
  list: 'جدول داده، فیلترها و صفحه‌بندی در این ناحیه قرار می‌گیرند.',
  detail: 'فرم جزئیات و تب‌های محتوا در این ناحیه قرار می‌گیرند.',
  settings: 'فرم‌های تنظیمات گروه‌بندی‌شده در این ناحیه قرار می‌گیرند.',
  blank: 'محتوای اختصاصی ماژول در این ناحیه قرار می‌گیرد.',
};

export function PlaceholderPanel({ template, moduleLabel }: PlaceholderPanelProps) {
  return (
    <div className="card-luxury border-dashed border-border bg-nude-50/80 p-8">
      <p className="text-sm font-medium text-stone-700">محل محتوای ماژول — {moduleLabel}</p>
      <p className="mt-2 text-sm text-stone-500">{templateHint[template]}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="h-24 rounded-xl bg-nude-100/80" />
        <div className="h-24 rounded-xl bg-nude-100/80" />
        <div className="col-span-full h-32 rounded-xl bg-nude-100/60" />
      </div>
    </div>
  );
}

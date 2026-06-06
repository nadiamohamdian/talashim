import type { Metadata } from 'next';
import { PublicPageShell } from '@/widgets/content/public-page-shell';

export const metadata: Metadata = {
  title: 'حریم خصوصی',
};

export default function PoliciesPage() {
  return (
    <PublicPageShell
      eyebrow="حقوقی"
      title="حریم خصوصی و سیاست‌ها"
      description="نحوه پردازش داده‌های شخصی و امنیت مالی."
    />
  );
}

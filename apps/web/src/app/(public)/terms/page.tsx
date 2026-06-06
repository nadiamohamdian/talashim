import type { Metadata } from 'next';
import { PublicPageShell } from '@/widgets/content/public-page-shell';

export const metadata: Metadata = {
  title: 'قوانین و مقررات',
};

export default function TermsPage() {
  return (
    <PublicPageShell
      eyebrow="حقوقی"
      title="قوانین و مقررات"
      description="شرایط استفاده از پلتفرم و معاملات."
    />
  );
}

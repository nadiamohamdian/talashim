import type { Metadata } from 'next';
import { ContactForm } from '@/features/contact/components/contact-form';
import { ContactInfoPanel } from '@/features/contact/components/contact-info-panel';
import { PublicPageShell } from '@/widgets/content/public-page-shell';

export const metadata: Metadata = {
  title: 'تماس با ما',
};

export default function ContactPage() {
  return (
    <PublicPageShell
      eyebrow="ارتباط"
      title="تماس با ما"
      description="راه‌های ارتباط با تیم فروش و پشتیبانی."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <ContactForm />
        <ContactInfoPanel />
      </div>
    </PublicPageShell>
  );
}

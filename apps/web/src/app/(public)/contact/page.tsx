import type { Metadata } from 'next';
import { ContactForm } from '@/features/contact/components/contact-form';
import { PublicPageShell } from '@/widgets/content/public-page-shell';

export const metadata: Metadata = {
  title: 'تماس با ما | Sadaf Gold',
};

export default function ContactPage() {
  return (
    <PublicPageShell
      eyebrow="ارتباط"
      title="تماس با ما"
      description="راه‌های ارتباط با تیم فروش و پشتیبانی."
    >
      <ContactForm />
    </PublicPageShell>
  );
}

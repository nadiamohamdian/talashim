import type { Metadata } from 'next';
import { CONTACT_PAGE_META } from '@/shared/config/contact-page';
import { ContactPageView } from '@/widgets/contact/contact-page-view';

export const metadata: Metadata = {
  title: CONTACT_PAGE_META.title,
  description: CONTACT_PAGE_META.description,
};

export default function ContactPage() {
  return <ContactPageView />;
}

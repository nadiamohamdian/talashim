import type { Metadata } from 'next';
import { PublicPageShell } from '@/widgets/content/public-page-shell';

export const metadata: Metadata = {
  title: 'درباره ما | Sadaf Gold',
};

export default function AboutPage() {
  return (
    <PublicPageShell
      eyebrow="برند"
      title="درباره صدف گلد"
      description="پلتفرم لوکس تجارت طلا و جواهر با تمرکز بر شفافیت قیمت و اعتماد."
    />
  );
}

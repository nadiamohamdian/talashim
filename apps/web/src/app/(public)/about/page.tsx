import type { Metadata } from 'next';
import { PublicPageShell } from '@/widgets/content/public-page-shell';

export const metadata: Metadata = {
  title: 'درباره ما',
};

export default function AboutPage() {
  return (
    <PublicPageShell
      eyebrow="برند"
      title="درباره طلاشیم"
      description="پلتفرم لوکس تجارت طلا و جواهر با تمرکز بر شفافیت قیمت و اعتماد."
    />
  );
}

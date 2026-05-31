import type { Metadata } from 'next';
import { PublicPageShell } from '@/widgets/content/public-page-shell';
import { PublicPricesContent } from '@/features/trading/components/public-prices-content';

export const metadata: Metadata = {
  title: 'قیمت لحظه‌ای طلا | Sadaf Gold',
  description: 'نرخ خرید و فروش طلا برای مهمانان — معامله نیاز به ورود دارد',
};

export default function LivePricesPage() {
  return (
    <PublicPageShell
      eyebrow="بازار"
      title="قیمت لحظه‌ای طلا"
      description="مشاهده نرخ‌ها برای همه بازدیدکنندگان. خرید و فروش در بخش معاملات پس از ورود فعال می‌شود."
    >
      <PublicPricesContent />
    </PublicPageShell>
  );
}

import type { Metadata } from 'next';
import { MemberLoginPrompt } from '@/features/auth/components/member-login-prompt';
import { TradingDashboard } from '@/widgets/trading/trading-dashboard';

export const metadata: Metadata = {
  title: 'معاملات طلا',
  description: 'داشبورد معاملات لحظه‌ای طلا',
};

export default function TradingPage() {
  return (
    <MemberLoginPrompt
      title="معاملات طلا"
      description="برای خرید و فروش و کیف پول وارد شوید. قیمت لحظه‌ای را در صفحه قیمت طلا ببینید."
      returnPath="/trading"
    >
      <TradingDashboard />
    </MemberLoginPrompt>
  );
}

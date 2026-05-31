import { Card } from '@sadafgold/ui';
import { ApiUnavailablePanel } from '@/widgets/admin/api-unavailable-panel';
import { API_REQUIREMENTS } from '@/shared/config/api-requirements';
import { PageHeader } from '@/widgets/admin/page-header';

export function VendorModuleIntro() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="فروشندگان (Marketplace)"
        description="معماری آماده برای multi-vendor — منتظر ماژول backend و مدل Vendor."
        availability="pending"
      />
      <Card className="border-zinc-800 bg-zinc-900/60 p-6 text-sm text-zinc-300">
        <h2 className="font-semibold text-zinc-100">آمادگی معماری Frontend</h2>
        <ul className="mt-3 list-inside list-disc space-y-2 text-zinc-400">
          <li>مسیرهای /vendors/* در IA تعریف شده‌اند</li>
          <li>پس از API، جداول درخواست، تأیید، محصولات و کیف پول vendor اضافه می‌شوند</li>
          <li>نقش‌های آینده: VENDOR, VENDOR_ADMIN در RBAC</li>
          <li>ساب‌دامین wholesale.sadafgold.com مستقل از پنل retail vendor باقی می‌ماند</li>
        </ul>
      </Card>
      <ApiUnavailablePanel {...API_REQUIREMENTS.vendors} />
    </div>
  );
}

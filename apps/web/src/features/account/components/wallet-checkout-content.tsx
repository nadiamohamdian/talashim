'use client';

import { WalletBalancesCard } from '@/features/trading/components/wallet-balances-card';
import { WalletTransactionsTable } from '@/features/trading/components/wallet-transactions-table';
import { WalletActions } from './wallet-actions';

export { CheckoutContent } from '@/features/checkout/components/checkout-content';

export function WalletPageContent() {
  return (
    <div className="space-y-8">
      <WalletBalancesCard variant="hero" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8">
        <WalletActions />

        <aside className="space-y-4">
          <div className="card-luxury p-5">
            <h3 className="text-sm font-semibold text-foreground">راهنمای واریز</h3>
            <ol className="mt-3 space-y-2.5 text-xs leading-6 text-muted">
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-dark/10 text-[10px] font-bold text-gold-dark">
                  ۱
                </span>
                مبلغ را به حساب شرکت واریز کنید.
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-dark/10 text-[10px] font-bold text-gold-dark">
                  ۲
                </span>
                تصویر فیش را بارگذاری و درخواست را ثبت کنید.
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-dark/10 text-[10px] font-bold text-gold-dark">
                  ۳
                </span>
                پس از تأیید پشتیبانی، موجودی شما شارژ می‌شود.
              </li>
            </ol>
          </div>

          <div className="rounded-2xl border border-gold-light/40 bg-gradient-to-br from-gold/5 to-transparent p-5">
            <p className="text-xs font-semibold text-gold-dark">امنیت مالی</p>
            <p className="mt-2 text-xs leading-6 text-muted">
              تمام تراکنش‌های کیف پول در دفتر کل ثبت و قابل پیگیری هستند. مبالغ فقط پس از
              تأیید فیش واریز می‌شوند.
            </p>
          </div>
        </aside>
      </div>

      <div className="card-luxury overflow-hidden">
        <div className="border-b border-border bg-nude-50/50 px-6 py-4 dark:bg-nude-50/5">
          <h2 className="section-heading text-base after:mt-2 after:h-0.5 after:w-8 md:text-lg">
            تاریخچه تراکنش‌ها
          </h2>
          <p className="mt-1 text-xs text-muted">واریز، برداشت و معاملات اخیر کیف پول</p>
        </div>
        <WalletTransactionsTable />
      </div>
    </div>
  );
}

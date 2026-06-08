'use client';

import type { ReactNode } from 'react';
import {
  deriveShippingFeeToman,
  formatGoldPricePerGramToman,
  formatWeightGramFa,
  GOLD_PRICE_PER_GRAM_UNIT_FA,
  platformConfig,
} from '@sadafgold/shared';
import type { OrderDetail } from '@sadafgold/types';
import { Button } from '@talashim/ui';
import { formatPersianDateTime } from '@/shared/lib/format-date';
import { formatToman, ORDER_STATUS_FA } from '../lib/labels';
import { getOrderInvoiceCustomerName } from '../lib/order-invoice';

interface AdminOrderInvoiceProps {
  order: OrderDetail;
}

const PAYMENT_PROVIDER_LABELS: Record<string, string> = {
  card_to_card: 'کارت به کارت',
  gateway: 'درگاه پرداخت',
  credit: 'اعتبار کیف پول',
};

function MetaRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#ececec] py-2.5 last:border-0">
      <span className="invoice-muted shrink-0 text-xs">{label}</span>
      <span className="invoice-text text-left text-sm font-medium">{value}</span>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e7e5e4] bg-[#ffffff] px-4 py-3.5">
      <p className="invoice-muted text-xs">{label}</p>
      <p className="invoice-text mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function PartyCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-[#e7e5e4] bg-[#fafaf9] p-5">
      <h2 className="invoice-accent text-sm font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function AdminOrderInvoice({ order }: AdminOrderInvoiceProps) {
  const shippingFeeToman = deriveShippingFeeToman(order);
  const paidPayment = order.payments.find((payment) => payment.status === 'paid');
  const customerName = getOrderInvoiceCustomerName(order);
  const invoiceFirstName = order.invoiceFirstName?.trim() ?? null;
  const invoiceLastName = order.invoiceLastName?.trim() ?? null;
  const taxPercent = order.taxPercent ?? 0;
  const statusLabel =
    ORDER_STATUS_FA[order.status.toUpperCase()] ??
    ORDER_STATUS_FA[order.status] ??
    order.status;

  return (
    <div className="invoice-document space-y-4">
      <div className="no-print flex justify-end">
        <Button
          variant="outline"
          className="border-[#e7e5e4] bg-white text-[#27272a] hover:bg-[#fafaf9]"
          onClick={() => window.print()}
        >
          چاپ فاکتور
        </Button>
      </div>

      <article className="invoice-sheet mx-auto w-full max-w-6xl overflow-hidden rounded-2xl border border-[#e7e5e4] bg-white shadow-[0_18px_50px_-24px_rgba(24,24,27,0.35)]">
        <header className="border-b border-[#e7e5e4] bg-gradient-to-l from-[#fffbeb] via-white to-[#fafaf9] px-6 py-8 md:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <span className="inline-flex rounded-full bg-[#fef3c7] px-3 py-1 text-xs font-semibold text-[#92400e]">
                فاکتور رسمی فروش طلا
              </span>
              <h1 className="invoice-text mt-4 text-2xl font-bold md:text-3xl">
                {platformConfig.storeName}
              </h1>
              <p className="invoice-muted mt-1 text-sm">
                پلتفرم خرید و فروش طلا — {platformConfig.name}
              </p>
            </div>

            <div className="w-full rounded-xl border border-[#e7e5e4] bg-white p-4 lg:max-w-sm">
              <MetaRow label="شماره فاکتور" value={<span className="font-mono">{order.orderNumber}</span>} />
              <MetaRow label="تاریخ ثبت سفارش" value={formatPersianDateTime(order.createdAt)} />
              {order.invoicePaidAt ? (
                <MetaRow label="تاریخ تأیید پرداخت" value={formatPersianDateTime(order.invoicePaidAt)} />
              ) : null}
              <MetaRow
                label="وضعیت"
                value={
                  <span className="inline-flex rounded-full bg-[#ecfdf5] px-2.5 py-0.5 text-xs font-medium text-[#047857]">
                    {statusLabel}
                  </span>
                }
              />
            </div>
          </div>
        </header>

        <section className="grid gap-3 border-b border-[#e7e5e4] bg-[#fafaf9] px-6 py-5 md:grid-cols-3 md:px-10">
          {order.liveGoldPrice18PerGramToman ? (
            <SummaryCard
              label="نرخ لحظه‌ای طلای ۱۸ عیار"
              value={`${formatGoldPricePerGramToman(order.liveGoldPrice18PerGramToman)} ${GOLD_PRICE_PER_GRAM_UNIT_FA}`}
            />
          ) : null}
          <SummaryCard
            label="مجموع وزن طلا"
            value={
              order.totalGoldWeightGram
                ? `${formatWeightGramFa(order.totalGoldWeightGram)} گرم`
                : '—'
            }
          />
          <SummaryCard label="نرخ مالیات" value={taxPercent > 0 ? `${taxPercent}٪` : '—'} />
        </section>

        <section className="grid gap-4 border-b border-[#e7e5e4] px-6 py-6 md:grid-cols-2 md:px-10">
          <PartyCard title="فروشنده">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="invoice-muted">نام</dt>
                <dd className="invoice-text font-medium">{platformConfig.storeName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="invoice-muted">برند</dt>
                <dd className="invoice-text font-medium">{platformConfig.name}</dd>
              </div>
            </dl>
          </PartyCard>

          <PartyCard title="خریدار">
            <dl className="space-y-2 text-sm">
              {invoiceFirstName ? (
                <div className="flex justify-between gap-4">
                  <dt className="invoice-muted">نام</dt>
                  <dd className="invoice-text font-medium">{invoiceFirstName}</dd>
                </div>
              ) : null}
              {invoiceLastName ? (
                <div className="flex justify-between gap-4">
                  <dt className="invoice-muted">نام خانوادگی</dt>
                  <dd className="invoice-text font-medium">{invoiceLastName}</dd>
                </div>
              ) : null}
              {!invoiceFirstName && !invoiceLastName ? (
                <div className="flex justify-between gap-4">
                  <dt className="invoice-muted">نام و نام خانوادگی</dt>
                  <dd className="invoice-text font-medium">{customerName}</dd>
                </div>
              ) : null}
              {order.customer?.nationalId ? (
                <div className="flex justify-between gap-4">
                  <dt className="invoice-muted">کد ملی</dt>
                  <dd className="invoice-text font-mono" dir="ltr">
                    {order.customer.nationalId}
                  </dd>
                </div>
              ) : null}
              {order.customer?.phone ? (
                <div className="flex justify-between gap-4">
                  <dt className="invoice-muted">موبایل</dt>
                  <dd className="invoice-text font-mono" dir="ltr">
                    {order.customer.phone}
                  </dd>
                </div>
              ) : null}
              {order.customer?.email ? (
                <div className="flex justify-between gap-4">
                  <dt className="invoice-muted">ایمیل</dt>
                  <dd className="invoice-text font-mono text-xs" dir="ltr">
                    {order.customer.email}
                  </dd>
                </div>
              ) : null}
            </dl>
          </PartyCard>
        </section>

        {order.shippingAddress ? (
          <section className="border-b border-[#e7e5e4] px-6 py-5 md:px-10">
            <h2 className="invoice-accent text-sm font-semibold">آدرس ارسال</h2>
            <p className="invoice-muted mt-3 rounded-xl border border-[#e7e5e4] bg-[#fafaf9] p-4 text-sm leading-7">
              <span className="invoice-text font-medium">{order.shippingAddress.recipient}</span>
              <span className="mx-2 text-[#d4d4d8]">|</span>
              <span dir="ltr">{order.shippingAddress.phone}</span>
              <br />
              {order.shippingAddress.state}، {order.shippingAddress.city}، {order.shippingAddress.line1}
              <br />
              کد پستی: <span className="invoice-text font-mono">{order.shippingAddress.postalCode}</span>
            </p>
          </section>
        ) : null}

        <section className="px-4 py-6 md:px-6">
          <div className="overflow-hidden rounded-xl border border-[#e7e5e4] bg-white">
            <div className="overflow-x-auto">
              <table className="invoice-table min-w-[920px] w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e7e5e4]">
                    <th className="px-3 py-3 text-right font-semibold">ردیف</th>
                    <th className="min-w-[160px] px-3 py-3 text-right font-semibold">شرح کالا</th>
                    <th className="px-3 py-3 text-right font-semibold">کد</th>
                    <th className="px-3 py-3 text-right font-semibold">عیار</th>
                    <th className="px-3 py-3 text-right font-semibold">وزن</th>
                    <th className="px-3 py-3 text-right font-semibold">تعداد</th>
                    <th className="px-3 py-3 text-right font-semibold">نرخ/گرم</th>
                    <th className="px-3 py-3 text-right font-semibold">ارزش طلا</th>
                    <th className="px-3 py-3 text-right font-semibold">اجرت</th>
                    <th className="px-3 py-3 text-right font-semibold">جمع</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={item.id} className="border-b border-[#f4f4f5] last:border-0">
                      <td className="invoice-muted px-3 py-3.5">{index + 1}</td>
                      <td className="invoice-text px-3 py-3.5 font-medium">{item.productTitle}</td>
                      <td className="invoice-text px-3 py-3.5 font-mono text-xs">{item.productSku ?? '—'}</td>
                      <td className="px-3 py-3.5">{item.karat ? `${item.karat}` : '—'}</td>
                      <td className="px-3 py-3.5">
                        {item.weightGram != null ? formatWeightGramFa(item.weightGram) : '—'}
                      </td>
                      <td className="px-3 py-3.5">{item.quantity}</td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-xs">
                        {item.liveGoldPricePerGramToman ? formatToman(item.liveGoldPricePerGramToman) : '—'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-xs">
                        {item.metalValueToman != null ? formatToman(item.metalValueToman) : '—'}
                      </td>
                      <td className="px-3 py-3.5 text-xs">
                        {item.wageToman != null ? (
                          <div>
                            <div>{formatToman(item.wageToman)}</div>
                            {item.makingFeePercent != null ? (
                              <div className="invoice-muted text-[11px]">({item.makingFeePercent}٪)</div>
                            ) : null}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="invoice-text whitespace-nowrap px-3 py-3.5 font-semibold">
                        {formatToman(item.lineTotalToman ?? item.unitPriceToman * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <footer className="border-t border-[#e7e5e4] bg-[#fafaf9] px-6 py-6 md:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <p className="invoice-muted max-w-xl text-xs leading-6">
              قیمت‌ها بر اساس نرخ لحظه‌ای طلا در زمان ثبت سفارش محاسبه شده‌اند. این فاکتور پس از تأیید
              پرداخت صادر شده و برای پیگیری و مراجعات رسمی معتبر است.
            </p>

            <div className="w-full rounded-xl border border-[#e7e5e4] bg-white p-5 lg:max-w-md">
              <div className="space-y-2.5 text-sm">
                {order.totalMetalValueToman != null ? (
                  <div className="flex justify-between gap-4">
                    <span className="invoice-muted">جمع ارزش طلا</span>
                    <span className="invoice-text font-medium">
                      {formatToman(order.totalMetalValueToman)} تومان
                    </span>
                  </div>
                ) : null}
                {order.totalWageToman != null ? (
                  <div className="flex justify-between gap-4">
                    <span className="invoice-muted">جمع اجرت ساخت</span>
                    <span className="invoice-text font-medium">
                      {formatToman(order.totalWageToman)} تومان
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between gap-4">
                  <span className="invoice-muted">جمع اقلام (قبل مالیات)</span>
                  <span className="invoice-text font-medium">{formatToman(order.subtotalToman)} تومان</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="invoice-muted">مالیات{taxPercent > 0 ? ` (${taxPercent}٪)` : ''}</span>
                  <span className="invoice-text font-medium">{formatToman(order.taxToman)} تومان</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="invoice-muted">هزینه ارسال</span>
                  <span className="invoice-text font-medium">
                    {shippingFeeToman === 0 ? 'رایگان' : `${formatToman(shippingFeeToman)} تومان`}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="invoice-muted">بیمه مرسوله</span>
                  <span className="invoice-text font-medium">
                    {order.insuranceFeeToman > 0
                      ? `${formatToman(order.insuranceFeeToman)} تومان`
                      : order.isInsured
                        ? 'فعال'
                        : '—'}
                  </span>
                </div>
                <div className="invoice-accent flex justify-between gap-4 border-t border-[#e7e5e4] pt-3 text-base font-bold">
                  <span>مبلغ قابل پرداخت</span>
                  <span>{formatToman(order.totalToman)} تومان</span>
                </div>
                {paidPayment ? (
                  <div className="invoice-muted flex justify-between gap-4 pt-1 text-xs">
                    <span>روش پرداخت</span>
                    <span>
                      {PAYMENT_PROVIDER_LABELS[paidPayment.provider] ?? paidPayment.provider}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </footer>
      </article>

      <style jsx global>{`
        @media print {
          .admin-layout,
          .admin-sidebar,
          .admin-header,
          .no-print {
            display: none !important;
          }
          body * {
            visibility: hidden;
          }
          .invoice-sheet,
          .invoice-sheet * {
            visibility: visible;
          }
          .invoice-sheet {
            position: absolute;
            inset: 0;
            width: 100%;
            max-width: none;
            border: none;
            box-shadow: none;
            border-radius: 0;
          }
        }
      `}</style>
    </div>
  );
}

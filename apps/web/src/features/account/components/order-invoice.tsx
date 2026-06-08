'use client';

import {
  deriveShippingFeeToman,
  formatGoldPricePerGramToman,
  formatWeightGramFa,
  GOLD_PRICE_PER_GRAM_UNIT_FA,
  platformConfig,
} from '@sadafgold/shared';
import type { OrderDetail } from '@sadafgold/types';
import { Badge, Button } from '@sadafgold/ui';
import { formatPrice } from '@/shared/lib/format-price';
import { formatPersianDate, formatPersianDateTime } from '@/shared/lib/persian-date';
import { getOrderInvoiceCustomerName } from '../lib/order-invoice';
import { ORDER_STATUS_LABELS } from '../lib/order-labels';

interface OrderInvoiceProps {
  order: OrderDetail;
  showActions?: boolean;
}

const PAYMENT_PROVIDER_LABELS: Record<string, string> = {
  card_to_card: 'کارت به کارت',
  gateway: 'درگاه پرداخت',
  credit: 'اعتبار کیف پول',
};

export function OrderInvoice({ order, showActions = true }: OrderInvoiceProps) {
  const shippingFeeToman = deriveShippingFeeToman(order);
  const paidPayment = order.payments.find((payment) => payment.status === 'paid');
  const customerName = getOrderInvoiceCustomerName(order);
  const taxPercent = order.taxPercent ?? 0;

  return (
    <div className="space-y-4">
      {showActions ? (
        <div className="no-print flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" onClick={() => window.print()}>
            چاپ فاکتور
          </Button>
        </div>
      ) : null}

      <article className="invoice-sheet mx-auto max-w-5xl overflow-hidden rounded-2xl border border-nude-200 bg-white shadow-md">
        <header className="border-b border-nude-200 bg-gradient-to-l from-gold-dark/5 via-white to-nude-50/80 px-6 py-8 md:px-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-xs font-semibold tracking-wide text-gold-dark">فاکتور رسمی فروش طلا</p>
              <h1 className="mt-3 text-2xl font-bold text-foreground md:text-3xl">
                {platformConfig.storeName}
              </h1>
              <p className="mt-1 text-sm text-muted">پلتفرم خرید و فروش طلا — {platformConfig.name}</p>
            </div>

            <div className="min-w-[240px] space-y-2 text-sm">
              <div className="flex items-center justify-between gap-6">
                <span className="text-muted">شماره فاکتور</span>
                <span className="font-mono font-semibold">{order.orderNumber}</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="text-muted">تاریخ ثبت سفارش</span>
                <span>{formatPersianDateTime(order.createdAt)}</span>
              </div>
              {order.invoicePaidAt ? (
                <div className="flex items-center justify-between gap-6">
                  <span className="text-muted">تاریخ تأیید پرداخت</span>
                  <span>{formatPersianDateTime(order.invoicePaidAt)}</span>
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-6">
                <span className="text-muted">وضعیت</span>
                <Badge className="bg-emerald-50 text-emerald-700">
                  {ORDER_STATUS_LABELS[order.status] ?? order.status}
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 border-b border-nude-200 bg-nude-50/40 px-6 py-5 text-sm md:grid-cols-3 md:px-10">
          {order.liveGoldPrice18PerGramToman ? (
            <div className="rounded-xl border border-nude-200 bg-white p-4">
              <p className="text-xs text-muted">نرخ لحظه‌ای طلای ۱۸ عیار (زمان ثبت)</p>
              <p className="mt-1 font-semibold text-gold-dark">
                {formatGoldPricePerGramToman(order.liveGoldPrice18PerGramToman)}{' '}
                {GOLD_PRICE_PER_GRAM_UNIT_FA}
              </p>
            </div>
          ) : null}
          <div className="rounded-xl border border-nude-200 bg-white p-4">
            <p className="text-xs text-muted">مجموع وزن طلا</p>
            <p className="mt-1 font-semibold">
              {order.totalGoldWeightGram
                ? `${formatWeightGramFa(order.totalGoldWeightGram)} گرم`
                : '—'}
            </p>
          </div>
          <div className="rounded-xl border border-nude-200 bg-white p-4">
            <p className="text-xs text-muted">نرخ مالیات</p>
            <p className="mt-1 font-semibold">{taxPercent > 0 ? `${taxPercent}٪` : '—'}</p>
          </div>
        </section>

        <section className="grid gap-6 border-b border-nude-200 px-6 py-8 md:grid-cols-2 md:px-10">
          <div className="rounded-xl border border-nude-200 bg-nude-50/50 p-5">
            <h2 className="text-sm font-semibold text-gold-dark">فروشنده</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">نام</dt>
                <dd className="font-medium">{platformConfig.storeName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">برند</dt>
                <dd className="font-medium">{platformConfig.name}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-nude-200 bg-nude-50/50 p-5">
            <h2 className="text-sm font-semibold text-gold-dark">خریدار</h2>
            <dl className="mt-4 space-y-2 text-sm">
              {order.customer?.firstName ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">نام</dt>
                  <dd className="font-medium">{order.customer.firstName}</dd>
                </div>
              ) : null}
              {order.customer?.lastName ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">نام خانوادگی</dt>
                  <dd className="font-medium">{order.customer.lastName}</dd>
                </div>
              ) : null}
              {!order.customer?.firstName && !order.customer?.lastName ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">نام و نام خانوادگی</dt>
                  <dd className="font-medium">{customerName}</dd>
                </div>
              ) : null}
              {order.customer?.nationalId ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">کد ملی</dt>
                  <dd className="font-mono" dir="ltr">
                    {order.customer.nationalId}
                  </dd>
                </div>
              ) : null}
              {order.customer?.phone ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">موبایل</dt>
                  <dd className="font-mono" dir="ltr">
                    {order.customer.phone}
                  </dd>
                </div>
              ) : null}
              {order.customer?.email ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">ایمیل</dt>
                  <dd className="font-mono text-xs" dir="ltr">
                    {order.customer.email}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        </section>

        {order.shippingAddress ? (
          <section className="border-b border-nude-200 px-6 py-6 md:px-10">
            <h2 className="text-sm font-semibold text-gold-dark">آدرس ارسال</h2>
            <p className="mt-3 text-sm leading-7 text-foreground">
              {order.shippingAddress.recipient} — {order.shippingAddress.phone}
              <br />
              {order.shippingAddress.state}، {order.shippingAddress.city}، {order.shippingAddress.line1}
              <br />
              کد پستی: <span className="font-mono">{order.shippingAddress.postalCode}</span>
            </p>
          </section>
        ) : null}

        <section className="px-4 py-6 md:px-10">
          <div className="overflow-x-auto">
            <table className="min-w-[920px] w-full text-sm">
              <thead>
                <tr className="border-b border-nude-200 text-muted">
                  <th className="px-2 py-3 text-right font-medium">ردیف</th>
                  <th className="px-2 py-3 text-right font-medium">شرح کالا</th>
                  <th className="px-2 py-3 text-right font-medium">کد کالا</th>
                  <th className="px-2 py-3 text-right font-medium">عیار</th>
                  <th className="px-2 py-3 text-right font-medium">وزن (گرم)</th>
                  <th className="px-2 py-3 text-right font-medium">تعداد</th>
                  <th className="px-2 py-3 text-right font-medium">نرخ لحظه‌ای/گرم</th>
                  <th className="px-2 py-3 text-right font-medium">ارزش طلا</th>
                  <th className="px-2 py-3 text-right font-medium">اجرت ساخت</th>
                  <th className="px-2 py-3 text-right font-medium">جمع خط</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={item.id} className="border-b border-nude-100 last:border-0">
                    <td className="px-2 py-4 text-muted">{index + 1}</td>
                    <td className="px-2 py-4 font-medium">{item.productTitle}</td>
                    <td className="px-2 py-4 font-mono text-xs">{item.productSku ?? '—'}</td>
                    <td className="px-2 py-4">{item.karat ? `${item.karat} عیار` : '—'}</td>
                    <td className="px-2 py-4">
                      {item.weightGram != null ? formatWeightGramFa(item.weightGram) : '—'}
                    </td>
                    <td className="px-2 py-4">{item.quantity}</td>
                    <td className="px-2 py-4 whitespace-nowrap">
                      {item.liveGoldPricePerGramToman
                        ? `${formatPrice(item.liveGoldPricePerGramToman)} ${GOLD_PRICE_PER_GRAM_UNIT_FA}`
                        : '—'}
                    </td>
                    <td className="px-2 py-4">
                      {item.metalValueToman != null
                        ? `${formatPrice(item.metalValueToman)} تومان`
                        : '—'}
                    </td>
                    <td className="px-2 py-4">
                      {item.wageToman != null ? (
                        <span>
                          {formatPrice(item.wageToman)} تومان
                          {item.makingFeePercent != null ? (
                            <span className="block text-xs text-muted">
                              ({item.makingFeePercent}٪ اجرت)
                            </span>
                          ) : null}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-2 py-4 font-semibold whitespace-nowrap">
                      {formatPrice(item.lineTotalToman ?? item.unitPriceToman * item.quantity)} تومان
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="border-t border-nude-200 bg-nude-50/60 px-6 py-6 md:px-10">
          <div className="ms-auto max-w-md space-y-2 text-sm">
            {order.totalMetalValueToman != null ? (
              <div className="flex justify-between gap-4">
                <span className="text-muted">جمع ارزش طلا</span>
                <span>{formatPrice(order.totalMetalValueToman)} تومان</span>
              </div>
            ) : null}
            {order.totalWageToman != null ? (
              <div className="flex justify-between gap-4">
                <span className="text-muted">جمع اجرت ساخت</span>
                <span>{formatPrice(order.totalWageToman)} تومان</span>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <span className="text-muted">جمع اقلام (قبل مالیات)</span>
              <span>{formatPrice(order.subtotalToman)} تومان</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted">مالیات{taxPercent > 0 ? ` (${taxPercent}٪)` : ''}</span>
              <span>{formatPrice(order.taxToman)} تومان</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted">هزینه ارسال</span>
              <span>
                {shippingFeeToman === 0 ? 'رایگان' : `${formatPrice(shippingFeeToman)} تومان`}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted">بیمه مرسوله</span>
              <span>
                {order.insuranceFeeToman > 0
                  ? `${formatPrice(order.insuranceFeeToman)} تومان`
                  : order.isInsured
                    ? 'فعال'
                    : '—'}
              </span>
            </div>
            <div className="flex justify-between gap-4 border-t border-nude-200 pt-3 text-base font-bold text-gold-dark">
              <span>مبلغ قابل پرداخت</span>
              <span>{formatPrice(order.totalToman)} تومان</span>
            </div>
            {paidPayment ? (
              <div className="flex justify-between gap-4 pt-1 text-xs text-muted">
                <span>روش پرداخت</span>
                <span>
                  {PAYMENT_PROVIDER_LABELS[paidPayment.provider] ?? paidPayment.provider}
                </span>
              </div>
            ) : null}
          </div>

          <p className="mt-8 text-center text-xs leading-6 text-muted">
            قیمت‌ها بر اساس نرخ لحظه‌ای طلا در زمان ثبت سفارش محاسبه شده‌اند. این فاکتور پس از تأیید
            پرداخت صادر شده و برای پیگیری و مراجعات رسمی معتبر است.
          </p>
        </footer>
      </article>

      <style jsx global>{`
        @media print {
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
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

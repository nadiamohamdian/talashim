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
import { Button } from '@sadafgold/ui';
import { formatPrice } from '@/shared/lib/format-price';
import { formatPersianDateTime } from '@/shared/lib/persian-date';
import {
  getOrderInvoiceCustomerName,
  getOrderInvoiceFirstName,
  getOrderInvoiceLastName,
} from '../lib/order-invoice';
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

function InvoiceMetaRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="invoice-meta-row">
      <span className="invoice-meta-label">{label}</span>
      <span className="invoice-meta-value">{value}</span>
    </div>
  );
}

function InvoicePartyField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="invoice-party-field">
      <dt className="invoice-party-label">{label}</dt>
      <dd className="invoice-party-value">{value}</dd>
    </div>
  );
}

export function OrderInvoice({ order, showActions = true }: OrderInvoiceProps) {
  const shippingFeeToman = deriveShippingFeeToman(order);
  const paidPayment = order.payments.find((payment) => payment.status === 'paid');
  const customerName = getOrderInvoiceCustomerName(order);
  const invoiceFirstName = getOrderInvoiceFirstName(order);
  const invoiceLastName = getOrderInvoiceLastName(order);
  const taxPercent = order.taxPercent ?? 0;

  return (
    <div className="invoice-root space-y-4">
      {showActions ? (
        <div className="no-print flex flex-wrap items-center justify-end gap-3">
          <Button variant="outline" className="invoice-print-btn" onClick={() => window.print()}>
            چاپ فاکتور
          </Button>
        </div>
      ) : null}

      <article className="invoice-sheet">
        <header className="invoice-header">
          <div className="invoice-header-main">
            <p className="invoice-kicker">فاکتور رسمی</p>
            <h1 className="invoice-brand">{platformConfig.storeName}</h1>
          </div>
          <div className="invoice-header-badge">
            <span className="invoice-badge-label">شماره</span>
            <span className="invoice-badge-value">{order.orderNumber}</span>
          </div>
        </header>

        <div className="invoice-divider" aria-hidden />

        <section className="invoice-meta-grid">
          <InvoiceMetaRow label="تاریخ ثبت" value={formatPersianDateTime(order.createdAt)} />
          {order.invoicePaidAt ? (
            <InvoiceMetaRow label="تأیید پرداخت" value={formatPersianDateTime(order.invoicePaidAt)} />
          ) : null}
          <InvoiceMetaRow
            label="وضعیت"
            value={ORDER_STATUS_LABELS[order.status] ?? order.status}
          />
          {paidPayment ? (
            <InvoiceMetaRow
              label="روش پرداخت"
              value={PAYMENT_PROVIDER_LABELS[paidPayment.provider] ?? paidPayment.provider}
            />
          ) : null}
          {order.liveGoldPrice18PerGramToman ? (
            <InvoiceMetaRow
              label="نرخ طلای ۱۸ عیار"
              value={`${formatGoldPricePerGramToman(order.liveGoldPrice18PerGramToman)} ${GOLD_PRICE_PER_GRAM_UNIT_FA}`}
            />
          ) : null}
          {order.totalGoldWeightGram ? (
            <InvoiceMetaRow
              label="وزن کل"
              value={`${formatWeightGramFa(order.totalGoldWeightGram)} گرم`}
            />
          ) : null}
        </section>

        <section className="invoice-parties">
          <div className="invoice-party">
            <h2 className="invoice-party-title">فروشنده</h2>
            <dl className="invoice-party-list">
              <InvoicePartyField label="نام" value={platformConfig.storeName} />
              <InvoicePartyField label="برند" value={platformConfig.name} />
            </dl>
          </div>

          <div className="invoice-party">
            <h2 className="invoice-party-title">خریدار</h2>
            <dl className="invoice-party-list">
              {invoiceFirstName ? (
                <InvoicePartyField label="نام" value={invoiceFirstName} />
              ) : null}
              {invoiceLastName ? (
                <InvoicePartyField label="نام خانوادگی" value={invoiceLastName} />
              ) : null}
              {!invoiceFirstName && !invoiceLastName ? (
                <InvoicePartyField label="نام کامل" value={customerName} />
              ) : null}
              {order.customer?.nationalId ? (
                <InvoicePartyField
                  label="کد ملی"
                  value={
                    <span dir="ltr" className="invoice-mono">
                      {order.customer.nationalId}
                    </span>
                  }
                />
              ) : null}
              {order.customer?.phone ? (
                <InvoicePartyField
                  label="موبایل"
                  value={
                    <span dir="ltr" className="invoice-mono">
                      {order.customer.phone}
                    </span>
                  }
                />
              ) : null}
              {order.customer?.email ? (
                <InvoicePartyField
                  label="ایمیل"
                  value={
                    <span dir="ltr" className="invoice-mono invoice-mono--sm">
                      {order.customer.email}
                    </span>
                  }
                />
              ) : null}
            </dl>
          </div>
        </section>

        {order.shippingAddress ? (
          <section className="invoice-shipping">
            <h2 className="invoice-section-label">آدرس ارسال</h2>
            <p className="invoice-shipping-text">
              {order.shippingAddress.recipient} · {order.shippingAddress.phone}
              <br />
              {order.shippingAddress.state}، {order.shippingAddress.city}،{' '}
              {order.shippingAddress.line1}
              <br />
              کد پستی{' '}
              <span className="invoice-mono">{order.shippingAddress.postalCode}</span>
            </p>
          </section>
        ) : null}

        <section className="invoice-items">
          <div className="invoice-table-wrap">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>ردیف</th>
                  <th>شرح</th>
                  <th>کد</th>
                  <th>عیار</th>
                  <th>وزن</th>
                  <th>تعداد</th>
                  <th>نرخ/گرم</th>
                  <th>ارزش طلا</th>
                  <th>اجرت</th>
                  <th>جمع</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="invoice-cell-muted">{index + 1}</td>
                    <td className="invoice-cell-title">{item.productTitle}</td>
                    <td className="invoice-mono invoice-cell-muted">{item.productSku ?? '—'}</td>
                    <td>{item.karat ? `${item.karat}` : '—'}</td>
                    <td>{item.weightGram != null ? formatWeightGramFa(item.weightGram) : '—'}</td>
                    <td>{item.quantity}</td>
                    <td className="invoice-cell-nowrap">
                      {item.liveGoldPricePerGramToman
                        ? formatPrice(item.liveGoldPricePerGramToman)
                        : '—'}
                    </td>
                    <td className="invoice-cell-nowrap">
                      {item.metalValueToman != null ? formatPrice(item.metalValueToman) : '—'}
                    </td>
                    <td className="invoice-cell-nowrap">
                      {item.wageToman != null ? (
                        <>
                          {formatPrice(item.wageToman)}
                          {item.makingFeePercent != null ? (
                            <span className="invoice-cell-sub">
                              {item.makingFeePercent}٪
                            </span>
                          ) : null}
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="invoice-cell-total">
                      {formatPrice(item.lineTotalToman ?? item.unitPriceToman * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="invoice-footer">
          <div className="invoice-totals">
            {order.totalMetalValueToman != null ? (
              <div className="invoice-total-row">
                <span>جمع ارزش طلا</span>
                <span>{formatPrice(order.totalMetalValueToman)} تومان</span>
              </div>
            ) : null}
            {order.totalWageToman != null ? (
              <div className="invoice-total-row">
                <span>جمع اجرت</span>
                <span>{formatPrice(order.totalWageToman)} تومان</span>
              </div>
            ) : null}
            <div className="invoice-total-row">
              <span>جمع اقلام</span>
              <span>{formatPrice(order.subtotalToman)} تومان</span>
            </div>
            <div className="invoice-total-row">
              <span>مالیات{taxPercent > 0 ? ` (${taxPercent}٪)` : ''}</span>
              <span>{formatPrice(order.taxToman)} تومان</span>
            </div>
            <div className="invoice-total-row">
              <span>ارسال</span>
              <span>
                {shippingFeeToman === 0 ? 'رایگان' : `${formatPrice(shippingFeeToman)} تومان`}
              </span>
            </div>
            <div className="invoice-total-row">
              <span>بیمه</span>
              <span>
                {order.insuranceFeeToman > 0
                  ? `${formatPrice(order.insuranceFeeToman)} تومان`
                  : order.isInsured
                    ? 'فعال'
                    : '—'}
              </span>
            </div>
            <div className="invoice-total-row invoice-total-row--grand">
              <span>مبلغ قابل پرداخت</span>
              <span>{formatPrice(order.totalToman)} تومان</span>
            </div>
          </div>

          <p className="invoice-note">
            قیمت‌ها بر اساس نرخ لحظه‌ای طلا در زمان ثبت سفارش محاسبه شده‌اند. این فاکتور پس از
            تأیید پرداخت صادر شده است.
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
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

'use client';

import { useRef, useState } from 'react';
import { Button, Input, Label } from '@sadafgold/ui';
import { DEFAULT_CARD_TO_CARD_INFO } from '@sadafgold/shared';
import {
  useWalletDepositRequest,
  useWalletWithdrawalRequest,
} from '@/lib/api/hooks/use-trading';
import { getApiErrorMessage } from '@/lib/api/client';

type WalletActionTab = 'deposit' | 'withdraw';

function CopyableRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value.replace(/\s/g, ''));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-muted">{label}</p>
        <p className={`mt-0.5 text-sm text-foreground ${mono ? 'font-mono tracking-wide' : ''}`}>
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 rounded-lg border border-nude-200 px-2.5 py-1 text-[11px] font-semibold text-gold-dark transition hover:border-gold-light hover:bg-nude-50"
      >
        {copied ? 'کپی شد' : 'کپی'}
      </button>
    </div>
  );
}

export function WalletActions() {
  const [tab, setTab] = useState<WalletActionTab>('deposit');
  const [amount, setAmount] = useState('');
  const [iban, setIban] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  const depositMutation = useWalletDepositRequest();
  const withdrawMutation = useWalletWithdrawalRequest();
  const isPending = depositMutation.isPending || withdrawMutation.isPending;

  const resetMessages = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleDeposit = async () => {
    resetMessages();
    const normalizedAmount = amount.replace(/[^\d]/g, '');
    if (!normalizedAmount || Number(normalizedAmount) <= 0) {
      setErrorMessage('مبلغ واریز را وارد کنید.');
      return;
    }
    if (!receiptFile) {
      setErrorMessage('تصویر فیش واریز را بارگذاری کنید.');
      return;
    }

    try {
      await depositMutation.mutateAsync({
        amountToman: normalizedAmount,
        file: receiptFile,
      });
      setAmount('');
      setReceiptFile(null);
      setSuccessMessage('درخواست واریز ثبت شد. پس از تأیید پشتیبانی، موجودی شما شارژ می‌شود.');
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    }
  };

  const handleWithdraw = async () => {
    resetMessages();
    const normalizedAmount = amount.replace(/[^\d]/g, '');
    const normalizedIban = iban.replace(/\s/g, '').toUpperCase();
    if (!normalizedAmount || Number(normalizedAmount) <= 0) {
      setErrorMessage('مبلغ برداشت را وارد کنید.');
      return;
    }
    if (!/^IR\d{24}$/.test(normalizedIban)) {
      setErrorMessage('شماره شبا معتبر نیست.');
      return;
    }

    try {
      await withdrawMutation.mutateAsync({
        amountToman: normalizedAmount,
        iban: normalizedIban,
      });
      setAmount('');
      setIban('');
      setSuccessMessage('درخواست برداشت ثبت شد. پس از بررسی، مبلغ به حساب شما واریز می‌شود.');
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    }
  };

  return (
    <div className="card-luxury overflow-hidden">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-sm font-semibold text-foreground">عملیات کیف پول</h2>
        <p className="mt-1 text-xs text-muted">واریز کارت‌به‌کارت یا برداشت به حساب بانکی</p>
      </div>

      <div className="p-6">
        <div className="inline-flex rounded-full border border-nude-200 bg-nude-50/60 p-1">
          <button
            type="button"
            onClick={() => {
              setTab('deposit');
              resetMessages();
            }}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              tab === 'deposit'
                ? 'bg-card text-gold-dark shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            واریز
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('withdraw');
              resetMessages();
            }}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              tab === 'withdraw'
                ? 'bg-card text-gold-dark shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            برداشت
          </button>
        </div>

        {tab === 'deposit' ? (
          <div className="mt-6 space-y-5">
            <div>
              <Label htmlFor="deposit-amount">مبلغ واریز (تومان)</Label>
              <Input
                id="deposit-amount"
                className="input-nude mt-2 h-12 rounded-xl px-4 text-base"
                inputMode="numeric"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="مثلاً ۱٬۰۰۰٬۰۰۰"
              />
            </div>

            <div className="rounded-2xl border border-nude-200 bg-gradient-to-br from-nude-50/80 to-card p-4">
              <p className="mb-1 text-xs font-semibold text-foreground">اطلاعات واریز</p>
              <p className="mb-3 text-[11px] leading-5 text-muted">
                مبلغ را به حساب زیر واریز کنید و سپس فیش را بارگذاری نمایید.
              </p>
              <div className="divide-y divide-nude-200/80">
                <CopyableRow label="بانک" value={DEFAULT_CARD_TO_CARD_INFO.bankName} />
                <CopyableRow label="به نام" value={DEFAULT_CARD_TO_CARD_INFO.accountHolder} />
                <CopyableRow
                  label="شماره کارت"
                  value={DEFAULT_CARD_TO_CARD_INFO.cardNumber}
                  mono
                />
                <CopyableRow label="شبا" value={DEFAULT_CARD_TO_CARD_INFO.iban} mono />
              </div>
            </div>

            <div
              className="rounded-2xl border-2 border-dashed border-nude-200 bg-card p-5 transition hover:border-gold-light/60"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  setReceiptFile(file);
                }
              }}
            >
              <h3 className="text-sm font-semibold text-foreground">بارگذاری فیش واریز</h3>
              <p className="mt-1 text-xs leading-6 text-muted">
                تصویر یا PDF فیش کارت‌به‌کارت را اینجا رها کنید یا انتخاب کنید.
              </p>
              <input
                ref={receiptInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(event) => {
                  setReceiptFile(event.target.files?.[0] ?? null);
                  event.target.value = '';
                }}
              />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-nude-200"
                  disabled={isPending}
                  onClick={() => receiptInputRef.current?.click()}
                >
                  {receiptFile ? 'تغییر فایل' : 'انتخاب فیش'}
                </Button>
                {receiptFile ? (
                  <span className="rounded-full bg-nude-50 px-3 py-1 text-xs text-muted">
                    {receiptFile.name}
                  </span>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              className="btn-gold w-full rounded-xl py-3 text-sm disabled:opacity-60"
              disabled={isPending}
              onClick={handleDeposit}
            >
              {isPending ? 'در حال ثبت…' : 'ثبت درخواست واریز'}
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <div>
              <Label htmlFor="withdraw-amount">مبلغ برداشت (تومان)</Label>
              <Input
                id="withdraw-amount"
                className="input-nude mt-2 h-12 rounded-xl px-4 text-base"
                inputMode="numeric"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="مثلاً ۵۰۰٬۰۰۰"
              />
            </div>
            <div>
              <Label htmlFor="withdraw-iban">شماره شبا مقصد</Label>
              <Input
                id="withdraw-iban"
                className="input-nude mt-2 h-12 rounded-xl px-4 font-mono text-base"
                dir="ltr"
                value={iban}
                onChange={(event) => setIban(event.target.value)}
                placeholder="IR120120000000001234567890"
              />
            </div>
            <p className="rounded-xl bg-nude-50/80 px-4 py-3 text-xs leading-6 text-muted">
              برداشت پس از بررسی پشتیبانی انجام می‌شود. موجودی کیف پول باید کافی باشد و شبا
              به نام صاحب حساب باشد.
            </p>
            <button
              type="button"
              className="btn-gold w-full rounded-xl py-3 text-sm disabled:opacity-60"
              disabled={isPending}
              onClick={handleWithdraw}
            >
              {isPending ? 'در حال ثبت…' : 'ثبت درخواست برداشت'}
            </button>
          </div>
        )}

        {successMessage ? (
          <p className="mt-5 rounded-xl border border-emerald-200/80 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {successMessage}
          </p>
        ) : null}
        {errorMessage ? (
          <p className="mt-5 rounded-xl border border-rose-200/80 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}

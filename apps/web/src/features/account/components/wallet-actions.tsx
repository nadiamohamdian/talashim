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
    <div className="card-luxury space-y-5 p-6">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setTab('deposit');
            resetMessages();
          }}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            tab === 'deposit'
              ? 'bg-gold-dark/10 text-gold-dark'
              : 'text-muted hover:bg-nude-50'
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
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            tab === 'withdraw'
              ? 'bg-gold-dark/10 text-gold-dark'
              : 'text-muted hover:bg-nude-50'
          }`}
        >
          برداشت
        </button>
      </div>

      {tab === 'deposit' ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="deposit-amount">مبلغ واریز (تومان)</Label>
            <Input
              id="deposit-amount"
              className="mt-1"
              inputMode="numeric"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="مثلاً ۱٬۰۰۰٬۰۰۰"
            />
          </div>

          <div className="rounded-2xl border border-nude-200 bg-nude-50/70 p-4 text-xs leading-7 text-stone-700">
            <p>
              <span className="font-semibold">بانک:</span> {DEFAULT_CARD_TO_CARD_INFO.bankName}
            </p>
            <p>
              <span className="font-semibold">به نام:</span>{' '}
              {DEFAULT_CARD_TO_CARD_INFO.accountHolder}
            </p>
            <p className="font-mono">
              <span className="font-sans font-semibold">کارت:</span>{' '}
              {DEFAULT_CARD_TO_CARD_INFO.cardNumber}
            </p>
            <p className="font-mono">
              <span className="font-sans font-semibold">شبا:</span>{' '}
              {DEFAULT_CARD_TO_CARD_INFO.iban}
            </p>
          </div>

          <div className="rounded-2xl border border-nude-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-foreground">بارگذاری فیش کارت‌به‌کارت</h3>
            <p className="mt-1 text-xs leading-6 text-muted">
              پس از واریز، تصویر فیش را بارگذاری کنید تا درخواست شما برای بررسی ارسال شود.
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
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => receiptInputRef.current?.click()}
              >
                {receiptFile ? 'تغییر تصویر فیش' : 'انتخاب تصویر فیش'}
              </Button>
              {receiptFile ? (
                <span className="text-xs text-muted">{receiptFile.name}</span>
              ) : null}
            </div>
          </div>

          <Button type="button" disabled={isPending} onClick={handleDeposit}>
            {isPending ? 'در حال ثبت...' : 'ثبت درخواست واریز'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label htmlFor="withdraw-amount">مبلغ برداشت (تومان)</Label>
            <Input
              id="withdraw-amount"
              className="mt-1"
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
              className="mt-1 font-mono"
              dir="ltr"
              value={iban}
              onChange={(event) => setIban(event.target.value)}
              placeholder="IR120120000000001234567890"
            />
          </div>
          <p className="text-xs leading-6 text-muted">
            برداشت پس از بررسی پشتیبانی انجام می‌شود. موجودی کیف پول باید کافی باشد.
          </p>
          <Button type="button" disabled={isPending} onClick={handleWithdraw}>
            {isPending ? 'در حال ثبت...' : 'ثبت درخواست برداشت'}
          </Button>
        </div>
      )}

      {successMessage ? (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</p>
      ) : null}
      {errorMessage ? (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p>
      ) : null}
    </div>
  );
}

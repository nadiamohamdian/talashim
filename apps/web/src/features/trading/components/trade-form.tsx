'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Button, Card, Input, Label, Tabs, TabsContent, TabsList, TabsTrigger } from '@sadafgold/ui';
import { getApiErrorMessage } from '@/lib/api';
import { formatPrice } from '@/shared/lib/format-price';
import { useStorefrontSettings } from '@/shared/providers/storefront-settings-provider';
import { useExecuteTrade } from '../hooks/use-execute-trade';
import { useLiveGoldPrice } from '../hooks/use-live-gold-price';
import { useWalletBalances } from '../hooks/use-wallet-balances';
import { estimateTradeQuote } from '../lib/trade-quote';
import { tradeFormSchema, type TradeFormValues } from '../model/schemas';
import { useTradingStore } from '../model/trading-store';

export function TradeForm() {
  const { gold } = useStorefrontSettings();
  const { side, setSide, karat, symbol } = useTradingStore();
  const { data: livePrice } = useLiveGoldPrice();
  const { data: balances } = useWalletBalances();
  const tradeMutation = useExecuteTrade();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<TradeFormValues>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues: { quantityGram: '1' },
  });

  const quantityGram = watch('quantityGram');

  useEffect(() => {
    tradeMutation.reset();
  }, [side]); // eslint-disable-line react-hooks/exhaustive-deps -- reset alerts when switching buy/sell

  const gramPresets = ['0.5', '1', '5', '10'].filter(
    (preset) => Number(preset) >= gold.minTradeGram,
  );

  const quote = useMemo(() => {
    const qty = Number(quantityGram);
    if (!livePrice || !Number.isFinite(qty) || qty <= 0) return null;

    const unitPrice =
      side === 'BUY' ? Number(livePrice.sellPrice) : Number(livePrice.buyPrice);

    return estimateTradeQuote({
      side,
      quantityGram: qty,
      unitPriceToman: unitPrice,
      commissionPercent: gold.tradeCommissionPercent,
    });
  }, [quantityGram, livePrice, side, gold.tradeCommissionPercent]);

  const belowMinTrade =
    Number.isFinite(Number(quantityGram)) && Number(quantityGram) < gold.minTradeGram;

  const onSubmit = handleSubmit(async (values) => {
    await tradeMutation.mutateAsync({
      side,
      quantityGram: values.quantityGram,
      karat,
      symbol,
    });
    reset({ quantityGram: values.quantityGram });
  });

  const insufficientBalance = useMemo(() => {
    if (!quote || !balances) return false;
    if (side === 'BUY') {
      return Number(balances.rialBalance) < quote.netRial;
    }
    return Number(balances.goldBalanceGram) < Number(quantityGram);
  }, [quote, balances, side, quantityGram]);

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold text-stone-950 dark:text-zinc-50">معامله بازار</h2>
      <p className="mt-1 text-sm text-stone-500 dark:text-zinc-400">
        خرید و فروش آنی طلا با قیمت لحظه‌ای
      </p>

      <Tabs
        value={side}
        onValueChange={(next) => setSide(next as typeof side)}
        className="mt-6"
      >
        <TabsList>
          <TabsTrigger value="BUY">خرید طلا</TabsTrigger>
          <TabsTrigger value="SELL">فروش طلا</TabsTrigger>
        </TabsList>

        <TabsContent value={side}>
          <form className="mt-4 space-y-4" onSubmit={onSubmit}>
            <div>
              <Label htmlFor="quantityGram">مقدار (گرم)</Label>
              <Input
                id="quantityGram"
                inputMode="decimal"
                className="mt-2"
                {...register('quantityGram')}
              />
              {errors.quantityGram ? (
                <p className="mt-1 text-xs text-rose-600">{errors.quantityGram.message}</p>
              ) : null}
              {belowMinTrade ? (
                <p className="mt-1 text-xs text-rose-600">
                  حداقل مقدار معامله {gold.minTradeGram} گرم است.
                </p>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-2">
                {gramPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className="rounded-xl border border-stone-200 px-3 py-1 text-xs font-medium text-stone-600 transition hover:border-amber-400 hover:text-amber-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-amber-500 dark:hover:text-amber-300"
                    onClick={() => setValue('quantityGram', preset, { shouldValidate: true })}
                  >
                    {preset} گرم
                  </button>
                ))}
              </div>
            </div>

            {quote ? (
              <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/40">
                <div className="flex justify-between py-1">
                  <span className="text-stone-500">مبلغ پایه</span>
                  <span>{formatPrice(quote.grossRial)} تومان</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-500">کارمزد ({quote.commissionPercent}%)</span>
                  <span>{formatPrice(quote.commissionRial)} تومان</span>
                </div>
                <div className="mt-2 flex justify-between border-t border-stone-200 pt-2 font-semibold dark:border-zinc-700">
                  <span>{side === 'BUY' ? 'پرداختی شما' : 'دریافتی شما'}</span>
                  <span className="text-amber-700 dark:text-amber-300">
                    {formatPrice(quote.netRial)} تومان
                  </span>
                </div>
              </div>
            ) : null}

            {insufficientBalance ? (
              <Alert variant="destructive">موجودی کیف پول برای این معامله کافی نیست</Alert>
            ) : null}

            {tradeMutation.isError ? (
              <Alert variant="destructive">
                {getApiErrorMessage(tradeMutation.error, 'خطا در ثبت معامله')}
              </Alert>
            ) : null}

            {tradeMutation.isSuccess ? (
              <Alert variant="success">معامله با موفقیت ثبت شد</Alert>
            ) : null}

            <Button
              type="submit"
              variant={side === 'BUY' ? 'buy' : 'sell'}
              className="w-full"
              disabled={
                tradeMutation.isPending ||
                insufficientBalance ||
                !livePrice ||
                !quote ||
                belowMinTrade
              }
            >
              {tradeMutation.isPending
                ? 'در حال اجرا...'
                : side === 'BUY'
                  ? 'ثبت خرید بازار'
                  : 'ثبت فروش بازار'}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

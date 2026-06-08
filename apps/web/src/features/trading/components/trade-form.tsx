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
import {
  formatGramQuantityLabel,
  formatQuantityForUnit,
  formatSotQuantityLabel,
  gramToSot,
  parseQuantityToGram,
  quantityGramToApiString,
  type TradeQuantityUnit,
} from '../lib/gold-weight-units';
import { estimateTradeQuote } from '../lib/trade-quote';
import { createTradeFormSchema, type TradeFormValues } from '../model/schemas';
import { useTradingStore } from '../model/trading-store';

const GRAM_PRESETS = ['0.01', '0.1', '0.5', '1'] as const;
const SOT_PRESETS = ['10', '50', '100', '500', '1000'] as const;

export function TradeForm() {
  const { gold } = useStorefrontSettings();
  const { side, setSide, karat, symbol } = useTradingStore();
  const { data: livePrice } = useLiveGoldPrice();
  const { data: balances } = useWalletBalances();
  const tradeMutation = useExecuteTrade();

  const tradeFormSchema = useMemo(
    () => createTradeFormSchema(gold.minTradeGram),
    [gold.minTradeGram],
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<TradeFormValues>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues: { quantity: '0.1', unit: 'gram' },
  });

  const quantity = watch('quantity');
  const unit = watch('unit');

  useEffect(() => {
    tradeMutation.reset();
  }, [side]); // eslint-disable-line react-hooks/exhaustive-deps -- reset alerts when switching buy/sell

  const quantityGram = useMemo(
    () => parseQuantityToGram(quantity, unit) ?? 0,
    [quantity, unit],
  );

  const gramPresets = GRAM_PRESETS.filter((preset) => Number(preset) >= gold.minTradeGram);
  const sotPresets = SOT_PRESETS.filter((preset) => Number(preset) >= gramToSot(gold.minTradeGram));
  const activePresets = unit === 'sot' ? sotPresets : gramPresets;

  const quote = useMemo(() => {
    if (!livePrice || quantityGram <= 0) return null;

    const unitPrice =
      side === 'BUY' ? Number(livePrice.sellPrice) : Number(livePrice.buyPrice);

    return estimateTradeQuote({
      side,
      quantityGram,
      unitPriceToman: unitPrice,
      commissionPercent: gold.tradeCommissionPercent,
    });
  }, [quantityGram, livePrice, side, gold.tradeCommissionPercent]);

  const equivalentLabel = useMemo(() => {
    if (quantityGram <= 0) return null;
    return unit === 'gram'
      ? `معادل ${formatSotQuantityLabel(gramToSot(quantityGram))}`
      : `معادل ${formatGramQuantityLabel(quantityGram)}`;
  }, [quantityGram, unit]);

  const handleUnitChange = (nextUnit: TradeQuantityUnit) => {
    if (nextUnit === unit) return;
    const gram = parseQuantityToGram(quantity, unit);
    if (gram) {
      setValue('quantity', formatQuantityForUnit(gram, nextUnit), { shouldValidate: true });
    }
    setValue('unit', nextUnit, { shouldValidate: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    const gram = parseQuantityToGram(values.quantity, values.unit);
    if (!gram) return;

    await tradeMutation.mutateAsync({
      side,
      quantityGram: quantityGramToApiString(gram),
      karat,
      symbol,
    });
    reset({ quantity: values.quantity, unit: values.unit });
  });

  const insufficientBalance = useMemo(() => {
    if (!quote || !balances || quantityGram <= 0) return false;
    if (side === 'BUY') {
      return Number(balances.rialBalance) < quote.netRial;
    }
    return Number(balances.goldBalanceGram) < quantityGram;
  }, [quote, balances, side, quantityGram]);

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold text-stone-950 dark:text-zinc-50">معامله بازار</h2>
      <p className="mt-1 text-sm text-stone-500 dark:text-zinc-400">
        خرید و فروش آنی طلا با قیمت لحظه‌ای — واحد گرم یا سوت (۱ سوت = ۰.۰۰۱ گرم)
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
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="quantity">
                  مقدار ({unit === 'sot' ? 'سوت' : 'گرم'})
                </Label>
                <div
                  className="inline-flex rounded-xl border border-stone-200 p-0.5 dark:border-zinc-700"
                  role="group"
                  aria-label="واحد معامله"
                >
                  <button
                    type="button"
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      unit === 'gram'
                        ? 'bg-amber-500/15 text-amber-800 dark:text-amber-200'
                        : 'text-stone-500 hover:text-stone-700 dark:text-zinc-400'
                    }`}
                    onClick={() => handleUnitChange('gram')}
                  >
                    گرم
                  </button>
                  <button
                    type="button"
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      unit === 'sot'
                        ? 'bg-amber-500/15 text-amber-800 dark:text-amber-200'
                        : 'text-stone-500 hover:text-stone-700 dark:text-zinc-400'
                    }`}
                    onClick={() => handleUnitChange('sot')}
                  >
                    سوت
                  </button>
                </div>
              </div>
              <Input
                id="quantity"
                inputMode="decimal"
                className="mt-2"
                step={unit === 'sot' ? '1' : '0.001'}
                placeholder={unit === 'sot' ? 'مثلاً ۱۰۰' : 'مثلاً ۰.۱'}
                {...register('quantity')}
              />
              {errors.quantity ? (
                <p className="mt-1 text-xs text-rose-600">{errors.quantity.message}</p>
              ) : null}
              {equivalentLabel ? (
                <p className="mt-1 text-xs text-stone-500 dark:text-zinc-400">{equivalentLabel}</p>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-2">
                {activePresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className="rounded-xl border border-stone-200 px-3 py-1 text-xs font-medium text-stone-600 transition hover:border-amber-400 hover:text-amber-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-amber-500 dark:hover:text-amber-300"
                    onClick={() => setValue('quantity', preset, { shouldValidate: true })}
                  >
                    {unit === 'sot'
                      ? `${new Intl.NumberFormat('fa-IR').format(Number(preset))} سوت`
                      : `${preset} گرم`}
                  </button>
                ))}
              </div>
            </div>

            {quote ? (
              <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/40">
                <div className="flex justify-between py-1 text-xs text-stone-500 dark:text-zinc-400">
                  <span>وزن معامله</span>
                  <span>{formatGramQuantityLabel(quantityGram)}</span>
                </div>
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
                quantityGram < gold.minTradeGram
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

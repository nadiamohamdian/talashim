import { z } from 'zod';

export const tradeFormSchema = z.object({
  quantityGram: z
    .string()
    .min(1, 'مقدار طلا را وارد کنید')
    .refine((value) => {
      const num = Number(value);
      return Number.isFinite(num) && num >= 0.01;
    }, 'حداقل ۰.۰۱ گرم'),
});

export type TradeFormValues = z.infer<typeof tradeFormSchema>;

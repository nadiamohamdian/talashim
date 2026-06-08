import { z } from 'zod';
import { gramToSot, parseQuantityToGram } from '../lib/gold-weight-units';

export function createTradeFormSchema(minTradeGram: number) {
  const minSot = gramToSot(minTradeGram);

  return z
    .object({
      unit: z.enum(['gram', 'sot']),
      quantity: z.string().min(1, 'مقدار طلا را وارد کنید'),
    })
    .superRefine((data, ctx) => {
      const gram = parseQuantityToGram(data.quantity, data.unit);
      if (!gram) {
        ctx.addIssue({
          code: 'custom',
          message: 'مقدار معتبر وارد کنید',
          path: ['quantity'],
        });
        return;
      }

      if (gram < minTradeGram) {
        ctx.addIssue({
          code: 'custom',
          message:
            data.unit === 'sot'
              ? `حداقل ${minSot.toLocaleString('fa-IR')} سوت (${minTradeGram} گرم)`
              : `حداقل ${minTradeGram} گرم`,
          path: ['quantity'],
        });
      }
    });
}

export type TradeFormValues = z.infer<ReturnType<typeof createTradeFormSchema>>;

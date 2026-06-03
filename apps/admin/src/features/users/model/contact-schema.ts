import { z } from 'zod';

const irMobile = z
  .string()
  .regex(/^09\d{9}$/, 'شماره موبایل باید با 09 شروع شود و ۱۱ رقم باشد');

const optionalMobile = z
  .string()
  .optional()
  .refine((value) => !value || /^09\d{9}$/.test(value), {
    message: 'شماره موبایل باید با 09 شروع شود و ۱۱ رقم باشد',
  });

export const userContactSchema = z.object({
  phone: optionalMobile,
  nationalId: z
    .string()
    .optional()
    .refine((value) => !value || /^\d{10}$/.test(value), {
      message: 'کد ملی باید ۱۰ رقم باشد',
    }),
  addressId: z.string().optional(),
  title: z.string().min(2, 'عنوان آدرس الزامی است'),
  recipient: z.string().min(2, 'نام گیرنده الزامی است'),
  addressPhone: irMobile,
  line1: z.string().min(5, 'آدرس کامل الزامی است'),
  city: z.string().min(2, 'شهر الزامی است'),
  state: z.string().min(2, 'استان الزامی است'),
  postalCode: z.string().min(5, 'کد پستی الزامی است'),
});

export type UserContactFormValues = z.infer<typeof userContactSchema>;

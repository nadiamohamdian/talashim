import { z } from 'zod';

const identifierSchema = z
  .string()
  .trim()
  .min(3, 'شماره موبایل یا ایمیل را وارد کنید')
  .refine(
    (value) =>
      z.email().safeParse(value).success ||
      /^(\+98|0)?9\d{9}$/.test(value.replace(/\s/g, '')),
    'فرمت ایمیل یا شماره موبایل معتبر نیست',
  );

export const otpRequestSchema = z.object({
  identifier: identifierSchema,
});

export const otpVerifySchema = z.object({
  identifier: identifierSchema,
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'کد تأیید باید ۶ رقم باشد'),
});

export const passwordLoginSchema = z.object({
  email: z.email('ایمیل معتبر وارد کنید'),
  password: z.string().min(8, 'رمز عبور حداقل ۸ کاراکتر باشد'),
});

export type OtpRequestValues = z.infer<typeof otpRequestSchema>;
export type OtpVerifyValues = z.infer<typeof otpVerifySchema>;
export type PasswordLoginValues = z.infer<typeof passwordLoginSchema>;

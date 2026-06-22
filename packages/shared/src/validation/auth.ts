import { z } from 'zod';
import { isValidIranMobile } from '../iranian-identity';

const iranMobileSchema = z
  .string()
  .trim()
  .refine((value) => isValidIranMobile(value), 'شماره موبایل معتبر وارد کنید');

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

export const phonePasswordLoginSchema = z.object({
  phone: iranMobileSchema,
  password: z.string().min(8, 'رمز عبور حداقل ۸ کاراکتر باشد'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8, 'رمز عبور جدید حداقل ۸ کاراکتر باشد'),
    confirmPassword: z.string().min(8, 'تکرار رمز عبور الزامی است'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'تکرار رمز عبور با رمز جدید یکسان نیست',
    path: ['confirmPassword'],
  });

export type OtpRequestValues = z.infer<typeof otpRequestSchema>;
export type OtpVerifyValues = z.infer<typeof otpVerifySchema>;
export type PasswordLoginValues = z.infer<typeof passwordLoginSchema>;
export type PhonePasswordLoginValues = z.infer<typeof phonePasswordLoginSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

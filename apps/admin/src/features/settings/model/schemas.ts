import { z } from 'zod';

export const generalSettingsSchema = z.object({
  storeName: z.string().min(2, 'نام فروشگاه الزامی است'),
  legalName: z.string().optional(),
  tagline: z.string().max(200).optional(),
  supportEmail: z.string().email('ایمیل پشتیبانی معتبر نیست'),
  supportPhone: z.string().min(8, 'شماره تماس الزامی است'),
  storefrontUrl: z.string().url('آدرس فروشگاه معتبر نیست'),
  contactAddress: z.string().min(5, 'آدرس تماس الزامی است'),
  businessHours: z.string().min(3, 'ساعات کاری را وارد کنید'),
  maintenanceMode: z.boolean(),
  maintenanceMessage: z.string().max(500).optional(),
});

export const commerceSettingsSchema = z.object({
  currencyLabel: z.string().min(1),
  minOrderToman: z.coerce.number().int().min(0),
  freeShippingMinToman: z.coerce.number().int().min(0),
  orderNumberPrefix: z.string().min(2).max(8),
  defaultTaxPercent: z.coerce.number().min(0).max(100),
  cartTtlHours: z.coerce.number().int().min(1).max(168),
  enableOnlinePayment: z.boolean(),
  enableWalletCheckout: z.boolean(),
  enableCod: z.boolean(),
  autoConfirmPaidOrders: z.boolean(),
});

export const goldSettingsSchema = z.object({
  displayKarat: z.coerce.number().int().refine((v) => v === 18 || v === 24, {
    message: 'عیار نمایش باید ۱۸ یا ۲۴ باشد',
  }),
  defaultMakingFeePercent: z.coerce.number().min(0).max(100),
  spreadPercent: z.coerce.number().min(0).max(50),
  tradeCommissionPercent: z.coerce.number().min(0).max(100),
  minTradeGram: z.coerce.number().positive(),
  marketRefreshSeconds: z.coerce.number().int().min(15).max(600),
  useLivePricingForProducts: z.boolean(),
  showGoldTickerInHeader: z.boolean(),
});

export const featureFlagsSchema = z.object({
  enableGoldTrading: z.boolean(),
  enableOtpLogin: z.boolean(),
  enableBlog: z.boolean(),
  requireKycForTrading: z.boolean(),
  requireKycForCheckout: z.boolean(),
  enableGuestCheckout: z.boolean(),
  enableWishlist: z.boolean(),
  enableInventoryReservation: z.boolean(),
  enableAdminAuditExport: z.boolean(),
});

export type GeneralSettings = z.infer<typeof generalSettingsSchema>;
export type CommerceSettings = z.infer<typeof commerceSettingsSchema>;
export type GoldSettings = z.infer<typeof goldSettingsSchema>;
export type FeatureFlagsSettings = z.infer<typeof featureFlagsSchema>;

export type PlatformSettings = {
  general: GeneralSettings;
  commerce: CommerceSettings;
  gold: GoldSettings;
  featureFlags: FeatureFlagsSettings;
  updatedAt: string | null;
};

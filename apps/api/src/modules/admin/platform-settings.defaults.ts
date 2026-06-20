import { platformConfig } from '@sadafgold/shared';

export type GeneralSettingsPayload = {
  storeName: string;
  legalName?: string;
  tagline?: string;
  supportEmail: string;
  supportPhone: string;
  storefrontUrl: string;
  contactAddress: string;
  businessHours: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
};

export type CommerceSettingsPayload = {
  currencyLabel: string;
  minOrderToman: number;
  freeShippingMinToman: number;
  orderNumberPrefix: string;
  defaultTaxPercent: number;
  cartTtlHours: number;
  enableOnlinePayment: boolean;
  enableWalletCheckout: boolean;
  enableCod: boolean;
  autoConfirmPaidOrders: boolean;
};

export type GoldSettingsPayload = {
  displayKarat: number;
  defaultMakingFeePercent: number;
  spreadPercent: number;
  tradeCommissionPercent: number;
  minTradeGram: number;
  marketRefreshSeconds: number;
  useLivePricingForProducts: boolean;
  showGoldTickerInHeader: boolean;
};

export type FeatureFlagsSettingsPayload = {
  enableGoldTrading: boolean;
  enableOtpLogin: boolean;
  enableBlog: boolean;
  requireKycForTrading: boolean;
  requireKycForCheckout: boolean;
  enableGuestCheckout: boolean;
  enableWishlist: boolean;
  enableInventoryReservation: boolean;
  enableAdminAuditExport: boolean;
};

export type PlatformSettingsPayload = {
  general: GeneralSettingsPayload;
  commerce: CommerceSettingsPayload;
  gold: GoldSettingsPayload;
  featureFlags: FeatureFlagsSettingsPayload;
  updatedAt: string;
};

export const DEFAULT_GENERAL_SETTINGS: GeneralSettingsPayload = {
  storeName: platformConfig.name,
  legalName: 'فروشگاه طلای طلاشیم',
  tagline: 'فروشگاه آنلاین طلا و جواهر با قیمت‌گذاری شفاف',
  supportEmail: 'support@talashim.local',
  supportPhone: '021-00000000',
  storefrontUrl: 'http://localhost:3000',
  contactAddress: 'تهران، خیابان نمونه، پلاک ۱',
  businessHours: 'شنبه تا پنج‌شنبه ۱۰ تا ۲۰',
  maintenanceMode: false,
  maintenanceMessage: 'فروشگاه موقتاً در حال به‌روزرسانی است. به زودی بازمی‌گردیم.',
};

export const DEFAULT_COMMERCE_SETTINGS: CommerceSettingsPayload = {
  currencyLabel: platformConfig.currencyLabel,
  minOrderToman: 500_000,
  freeShippingMinToman: 5_000_000,
  orderNumberPrefix: 'TL',
  defaultTaxPercent: 9,
  cartTtlHours: 48,
  enableOnlinePayment: true,
  enableWalletCheckout: true,
  enableCod: false,
  autoConfirmPaidOrders: false,
};

export const DEFAULT_GOLD_SETTINGS: GoldSettingsPayload = {
  displayKarat: 18,
  defaultMakingFeePercent: 12,
  spreadPercent: 1.5,
  tradeCommissionPercent: 0.5,
  minTradeGram: 0.01,
  marketRefreshSeconds: 30,
  useLivePricingForProducts: true,
  showGoldTickerInHeader: true,
};

export const DEFAULT_FEATURE_FLAGS: FeatureFlagsSettingsPayload = {
  enableGoldTrading: true,
  enableOtpLogin: true,
  enableBlog: true,
  requireKycForTrading: true,
  requireKycForCheckout: false,
  enableGuestCheckout: false,
  enableWishlist: true,
  enableInventoryReservation: true,
  enableAdminAuditExport: false,
};

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettingsPayload = {
  general: DEFAULT_GENERAL_SETTINGS,
  commerce: DEFAULT_COMMERCE_SETTINGS,
  gold: DEFAULT_GOLD_SETTINGS,
  featureFlags: DEFAULT_FEATURE_FLAGS,
  updatedAt: new Date(0).toISOString(),
};

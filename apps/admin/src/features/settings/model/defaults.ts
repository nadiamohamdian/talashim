import { platformConfig } from '@sadafgold/shared';
import type {
  CommerceSettings,
  FeatureFlagsSettings,
  GeneralSettings,
  GoldSettings,
  PlatformSettings,
} from './schemas';

export const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
  storeName: platformConfig.name,
  legalName: 'فروشگاه طلای تلاشیم',
  tagline: 'فروشگاه آنلاین طلا و جواهر با قیمت‌گذاری شفاف',
  supportEmail: 'support@talashim.local',
  supportPhone: '021-00000000',
  storefrontUrl: 'http://localhost:3000',
  contactAddress: 'تهران، خیابان نمونه، پلاک ۱',
  businessHours: 'شنبه تا پنج‌شنبه ۱۰ تا ۲۰',
  maintenanceMode: false,
  maintenanceMessage: 'فروشگاه موقتاً در حال به‌روزرسانی است. به زودی بازمی‌گردیم.',
};

export const DEFAULT_COMMERCE_SETTINGS: CommerceSettings = {
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

export const DEFAULT_GOLD_SETTINGS: GoldSettings = {
  displayKarat: 18,
  defaultMakingFeePercent: 12,
  spreadPercent: 1.5,
  tradeCommissionPercent: 0.5,
  minTradeGram: 0.01,
  marketRefreshSeconds: 30,
  useLivePricingForProducts: true,
  showGoldTickerInHeader: true,
};

export const DEFAULT_FEATURE_FLAGS: FeatureFlagsSettings = {
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

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  general: DEFAULT_GENERAL_SETTINGS,
  commerce: DEFAULT_COMMERCE_SETTINGS,
  gold: DEFAULT_GOLD_SETTINGS,
  featureFlags: DEFAULT_FEATURE_FLAGS,
  updatedAt: null,
};

import { platformConfig } from '@sadafgold/shared';
import type { StorefrontSettings } from '@/shared/model/storefront-settings';

export const DEFAULT_STOREFRONT_SETTINGS: StorefrontSettings = {
  maintenanceMode: false,
  maintenanceMessage: null,
  general: {
    storeName: platformConfig.storeName,
    tagline: 'فروشگاه آنلاین طلا و جواهر با قیمت‌گذاری شفاف',
    supportEmail: 'support@talashim.local',
    supportPhone: '021-00000000',
    contactAddress: 'تهران',
    businessHours: 'شنبه تا پنج‌شنبه ۱۰ تا ۲۰',
  },
  commerce: {
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
  },
  gold: {
    displayKarat: 18,
    defaultMakingFeePercent: 12,
    spreadPercent: 1.5,
    tradeCommissionPercent: 0.5,
    minTradeGram: 0.01,
    marketRefreshSeconds: 30,
    useLivePricingForProducts: true,
    showGoldTickerInHeader: true,
  },
  featureFlags: {
    enableGoldTrading: true,
    enableOtpLogin: true,
    enableBlog: true,
    requireKycForTrading: true,
    requireKycForCheckout: false,
    enableGuestCheckout: false,
    enableWishlist: true,
    enableInventoryReservation: true,
    enableAdminAuditExport: false,
  },
  updatedAt: null,
};

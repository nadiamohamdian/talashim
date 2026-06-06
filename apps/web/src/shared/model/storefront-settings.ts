import type { CheckoutPaymentProvider } from '@sadafgold/shared';

export type StorefrontGeneralSettings = {
  storeName: string;
  tagline: string | null;
  supportEmail: string;
  supportPhone: string;
  contactAddress: string;
  businessHours: string;
};

export type StorefrontCommerceSettings = {
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

export type StorefrontGoldSettings = {
  displayKarat: number;
  defaultMakingFeePercent: number;
  spreadPercent: number;
  tradeCommissionPercent: number;
  minTradeGram: number;
  marketRefreshSeconds: number;
  useLivePricingForProducts: boolean;
  showGoldTickerInHeader: boolean;
};

export type StorefrontFeatureFlags = {
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

export type StorefrontSettings = {
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  general: StorefrontGeneralSettings;
  commerce: StorefrontCommerceSettings;
  gold: StorefrontGoldSettings;
  featureFlags: StorefrontFeatureFlags;
  updatedAt: string | null;
};

export function getEnabledPaymentProviders(
  commerce: StorefrontCommerceSettings,
): CheckoutPaymentProvider[] {
  const providers: CheckoutPaymentProvider[] = [];
  if (commerce.enableOnlinePayment) {
    providers.push('card_to_card', 'gateway');
  }
  if (commerce.enableWalletCheckout) {
    providers.push('credit');
  }
  return providers.length > 0 ? providers : ['card_to_card'];
}

import { ForbiddenException } from '@nestjs/common';
import { SHIPPING_INSURANCE_PERCENT, type CheckoutPaymentProvider } from '@sadafgold/shared';
import type { FeatureFlagsSettingsPayload } from '@/modules/admin/platform-settings.defaults';
import { getPlatformSettings } from './platform-settings-runtime';

export function assertFeatureEnabled(
  flag: keyof FeatureFlagsSettingsPayload,
  messageFa: string,
): void {
  if (!getPlatformSettings().featureFlags[flag]) {
    throw new ForbiddenException(messageFa);
  }
}

export function getEnabledCheckoutProviders(): CheckoutPaymentProvider[] {
  const { commerce } = getPlatformSettings();
  const providers: CheckoutPaymentProvider[] = [];
  if (commerce.enableOnlinePayment) {
    providers.push('card_to_card', 'gateway');
  }
  if (commerce.enableWalletCheckout) {
    providers.push('credit');
  }
  return providers.length > 0 ? providers : ['card_to_card'];
}

export function getCheckoutTaxRate(): number {
  return getPlatformSettings().commerce.defaultTaxPercent / 100;
}

export function getMinOrderToman(): number {
  return getPlatformSettings().commerce.minOrderToman;
}

export function getFreeShippingMinToman(): number {
  return getPlatformSettings().commerce.freeShippingMinToman;
}

export function getShippingInsurancePercent(): number {
  return SHIPPING_INSURANCE_PERCENT;
}

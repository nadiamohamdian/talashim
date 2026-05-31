import {
  LedgerAccountCategory,
  LedgerSide,
  WalletAssetType,
} from '@/generated/prisma';

export const SYSTEM_LEDGER_ACCOUNTS = [
  {
    code: 'PLATFORM_CASH_RIAL',
    name: 'Platform Cash Rial',
    category: LedgerAccountCategory.ASSET,
    assetType: WalletAssetType.RIAL,
  },
  {
    code: 'PLATFORM_GOLD_VAULT',
    name: 'Platform Gold Vault',
    category: LedgerAccountCategory.ASSET,
    assetType: WalletAssetType.GOLD,
  },
  {
    code: 'FEE_REVENUE_RIAL',
    name: 'Fee Revenue Rial',
    category: LedgerAccountCategory.REVENUE,
    assetType: WalletAssetType.RIAL,
  },
] as const;

export function userWalletAccountCode(
  userId: string,
  assetType: WalletAssetType,
): string {
  return `USER_${assetType}_${userId}`;
}

export function liabilityBalanceDelta(
  side: LedgerSide,
  amount: number,
): number {
  return side === LedgerSide.CREDIT ? amount : -amount;
}

export function assetBalanceDelta(side: LedgerSide, amount: number): number {
  return side === LedgerSide.DEBIT ? amount : -amount;
}

export function accountBalanceDelta(
  category: LedgerAccountCategory,
  side: LedgerSide,
  amount: number,
): number {
  switch (category) {
    case LedgerAccountCategory.ASSET:
    case LedgerAccountCategory.EXPENSE:
      return assetBalanceDelta(side, amount);
    case LedgerAccountCategory.LIABILITY:
    case LedgerAccountCategory.EQUITY:
    case LedgerAccountCategory.REVENUE:
      return liabilityBalanceDelta(side, amount);
    default:
      return 0;
  }
}

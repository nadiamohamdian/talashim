import { WalletAssetType } from '@/generated/prisma';
import { Injectable } from '@nestjs/common';
import { LedgerRepository } from '@/modules/ledger/repositories/ledger.repository';
import { userWalletAccountCode } from '@/modules/ledger/constants/system-accounts';

@Injectable()
export class WalletRepository {
  constructor(private readonly ledgerRepository: LedgerRepository) {}

  ensureUserWallets(userId: string) {
    return Promise.all([
      this.ledgerRepository.ensureUserWalletAccount(userId, WalletAssetType.RIAL),
      this.ledgerRepository.ensureUserWalletAccount(userId, WalletAssetType.GOLD),
    ]);
  }

  getUserWalletCodes(userId: string) {
    return {
      rial: userWalletAccountCode(userId, WalletAssetType.RIAL),
      gold: userWalletAccountCode(userId, WalletAssetType.GOLD),
    };
  }
}

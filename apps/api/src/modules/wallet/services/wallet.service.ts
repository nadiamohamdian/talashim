import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  LedgerSide,
  WalletAssetType,
  WalletTransactionType,
} from '@/generated/prisma';
import { LedgerService } from '@/modules/ledger/services/ledger.service';
import { LedgerRepository } from '@/modules/ledger/repositories/ledger.repository';
import { userWalletAccountCode } from '@/modules/ledger/constants/system-accounts';
import type { DepositGoldDto } from '../dto/deposit-gold.dto';
import type { DepositRialDto } from '../dto/deposit-rial.dto';
import type { TransferWalletDto } from '../dto/transfer-wallet.dto';
import type { WalletHistoryQueryDto } from '../dto/wallet-history-query.dto';
import { WalletRepository } from '../repositories/wallet.repository';

@Injectable()
export class WalletService {
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly ledgerService: LedgerService,
    private readonly ledgerRepository: LedgerRepository,
  ) {}

  async getBalances(userId: string) {
    await this.walletRepository.ensureUserWallets(userId);
    const codes = this.walletRepository.getUserWalletCodes(userId);

    const [rialAccount, goldAccount] = await Promise.all([
      this.ledgerRepository.findAccountByCode(codes.rial),
      this.ledgerRepository.findAccountByCode(codes.gold),
    ]);

    if (!rialAccount || !goldAccount) {
      throw new NotFoundException('Wallet accounts not found');
    }

    const [rialBalance, goldBalanceGram] = await Promise.all([
      this.ledgerRepository.calculateAccountBalance(rialAccount.id),
      this.ledgerRepository.calculateAccountBalance(goldAccount.id),
    ]);

    return {
      rialBalance: rialBalance.toFixed(0),
      goldBalanceGram: goldBalanceGram.toFixed(6),
    };
  }

  async depositRial(payload: DepositRialDto) {
    await this.walletRepository.ensureUserWallets(payload.userId);
    const userAccountCode = userWalletAccountCode(payload.userId, WalletAssetType.RIAL);

    return this.ledgerService.postJournal({
      reference: `rial-deposit-${payload.idempotencyKey}`,
      idempotencyKey: payload.idempotencyKey,
      type: WalletTransactionType.DEPOSIT,
      userId: payload.userId,
      description: payload.description ?? 'Rial wallet deposit',
      lines: [
        {
          accountCode: 'PLATFORM_CASH_RIAL',
          side: LedgerSide.DEBIT,
          assetType: WalletAssetType.RIAL,
          amount: payload.amountToman,
        },
        {
          accountCode: userAccountCode,
          side: LedgerSide.CREDIT,
          assetType: WalletAssetType.RIAL,
          amount: payload.amountToman,
        },
      ],
      actorId: payload.userId,
    });
  }

  async depositGold(payload: DepositGoldDto) {
    await this.walletRepository.ensureUserWallets(payload.userId);
    const userAccountCode = userWalletAccountCode(payload.userId, WalletAssetType.GOLD);

    return this.ledgerService.postJournal({
      reference: `gold-deposit-${payload.idempotencyKey}`,
      idempotencyKey: payload.idempotencyKey,
      type: WalletTransactionType.DEPOSIT,
      userId: payload.userId,
      description: payload.description ?? 'Gold wallet deposit',
      lines: [
        {
          accountCode: 'PLATFORM_GOLD_VAULT',
          side: LedgerSide.DEBIT,
          assetType: WalletAssetType.GOLD,
          amount: payload.amountGram,
        },
        {
          accountCode: userAccountCode,
          side: LedgerSide.CREDIT,
          assetType: WalletAssetType.GOLD,
          amount: payload.amountGram,
        },
      ],
      actorId: payload.userId,
    });
  }

  async transfer(payload: TransferWalletDto) {
    if (payload.userId === payload.recipientUserId) {
      throw new BadRequestException('Cannot transfer to the same wallet');
    }

    await Promise.all([
      this.walletRepository.ensureUserWallets(payload.userId),
      this.walletRepository.ensureUserWallets(payload.recipientUserId),
    ]);

    const senderCode = userWalletAccountCode(payload.userId, payload.assetType);
    const recipientCode = userWalletAccountCode(
      payload.recipientUserId,
      payload.assetType,
    );

    const senderAccount = await this.ledgerRepository.findAccountByCode(senderCode);
    if (!senderAccount) {
      throw new NotFoundException('Sender wallet not found');
    }

    const senderBalance = await this.ledgerRepository.calculateAccountBalance(
      senderAccount.id,
    );
    if (senderBalance < Number(payload.amount)) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    return this.ledgerService.postJournal({
      reference: `transfer-${payload.idempotencyKey}`,
      idempotencyKey: payload.idempotencyKey,
      type: WalletTransactionType.TRANSFER,
      userId: payload.userId,
      description: payload.description ?? 'Wallet transfer',
      metadata: { recipientUserId: payload.recipientUserId },
      lines: [
        {
          accountCode: senderCode,
          side: LedgerSide.DEBIT,
          assetType: payload.assetType,
          amount: payload.amount,
        },
        {
          accountCode: recipientCode,
          side: LedgerSide.CREDIT,
          assetType: payload.assetType,
          amount: payload.amount,
        },
      ],
      actorId: payload.userId,
    });
  }

  async getHistory(userId: string, query: WalletHistoryQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.ledgerRepository.listTransactions(userId, skip, limit),
      this.ledgerRepository.countTransactions(userId),
    ]);

    return {
      page,
      limit,
      total,
      items: items.map((item) => ({
        id: item.id,
        reference: item.reference,
        type: item.type,
        status: item.status,
        description: item.description,
        createdAt: item.createdAt,
        entries: item.entries.map((entry) => ({
          accountCode: entry.account.code,
          side: entry.side,
          assetType: entry.assetType,
          amount: entry.amount.toString(),
        })),
      })),
    };
  }
}

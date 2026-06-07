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
import type { UploadedImageFile } from '@/infrastructure/media/media-storage.service';
import { MediaStorageService } from '@/infrastructure/media/media-storage.service';
import { LedgerService } from '@/modules/ledger/services/ledger.service';
import { LedgerRepository } from '@/modules/ledger/repositories/ledger.repository';
import { userWalletAccountCode } from '@/modules/ledger/constants/system-accounts';
import type { DepositGoldDto } from '../dto/deposit-gold.dto';
import type { DepositRialDto } from '../dto/deposit-rial.dto';
import type { RequestRialDepositDto } from '../dto/request-rial-deposit.dto';
import type { RequestRialWithdrawalDto } from '../dto/request-rial-withdrawal.dto';
import type { TransferWalletDto } from '../dto/transfer-wallet.dto';
import type { WalletHistoryQueryDto } from '../dto/wallet-history-query.dto';
import { WalletRepository } from '../repositories/wallet.repository';

const MAX_RIAL_DEPOSIT_TOMAN = 500_000_000;
const MAX_RIAL_WITHDRAWAL_TOMAN = 200_000_000;

@Injectable()
export class WalletService {
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly ledgerService: LedgerService,
    private readonly ledgerRepository: LedgerRepository,
    private readonly mediaStorage: MediaStorageService,
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

  async requestRialDeposit(
    userId: string,
    payload: RequestRialDepositDto,
    receiptFile: UploadedImageFile,
  ) {
    const amount = this.parsePositiveRialAmount(payload.amountToman, MAX_RIAL_DEPOSIT_TOMAN);
    await this.walletRepository.ensureUserWallets(userId);

    const existing = await this.ledgerRepository.findExistingTransaction(payload.idempotencyKey);
    if (existing) {
      return existing;
    }

    const saved = await this.mediaStorage.saveReceipt(receiptFile, 'wallet-deposits');

    return this.ledgerRepository.createPendingTransaction({
      reference: `rial-deposit-request-${payload.idempotencyKey}`,
      idempotencyKey: payload.idempotencyKey,
      type: WalletTransactionType.DEPOSIT,
      userId,
      description: 'درخواست واریز به کیف پول',
      metadata: {
        amountToman: amount.toFixed(0),
        receiptUrl: saved.url,
        provider: 'card_to_card',
      },
      actorId: userId,
    });
  }

  async requestRialWithdrawal(userId: string, payload: RequestRialWithdrawalDto) {
    const amount = this.parsePositiveRialAmount(payload.amountToman, MAX_RIAL_WITHDRAWAL_TOMAN);
    const iban = payload.iban.toUpperCase();
    await this.walletRepository.ensureUserWallets(userId);

    const existing = await this.ledgerRepository.findExistingTransaction(payload.idempotencyKey);
    if (existing) {
      return existing;
    }

    const codes = this.walletRepository.getUserWalletCodes(userId);
    const rialAccount = await this.ledgerRepository.findAccountByCode(codes.rial);
    if (!rialAccount) {
      throw new NotFoundException('Rial wallet not found');
    }

    const rialBalance = await this.ledgerRepository.calculateAccountBalance(rialAccount.id);
    if (rialBalance < amount) {
      throw new BadRequestException('موجودی کیف پول برای برداشت کافی نیست');
    }

    return this.ledgerRepository.createPendingTransaction({
      reference: `rial-withdrawal-request-${payload.idempotencyKey}`,
      idempotencyKey: payload.idempotencyKey,
      type: WalletTransactionType.WITHDRAWAL,
      userId,
      description: 'درخواست برداشت از کیف پول',
      metadata: {
        amountToman: amount.toFixed(0),
        iban,
      },
      actorId: userId,
    });
  }

  private parsePositiveRialAmount(raw: string, max: number): number {
    const amount = Number(raw);
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount)) {
      throw new BadRequestException('مبلغ وارد شده معتبر نیست');
    }
    if (amount > max) {
      throw new BadRequestException('مبلغ از سقف مجاز بیشتر است');
    }
    return amount;
  }

  async approveRialDepositRequest(transactionId: string, actorId: string) {
    const pending = await this.ledgerRepository.findTransactionById(transactionId);
    if (!pending?.userId) {
      throw new NotFoundException('تراکنش یافت نشد');
    }
    await this.walletRepository.ensureUserWallets(pending.userId);
    return this.ledgerRepository.completePendingRialDeposit(transactionId, actorId);
  }

  async rejectRialDepositRequest(transactionId: string, actorId: string, reason: string) {
    return this.ledgerRepository.rejectPendingRialDeposit(transactionId, actorId, reason);
  }

  async approveRialWithdrawalRequest(transactionId: string, actorId: string) {
    const pending = await this.ledgerRepository.findTransactionById(transactionId);
    if (!pending?.userId) {
      throw new NotFoundException('تراکنش یافت نشد');
    }
    await this.walletRepository.ensureUserWallets(pending.userId);
    return this.ledgerRepository.completePendingRialWithdrawal(transactionId, actorId);
  }

  async rejectRialWithdrawalRequest(transactionId: string, actorId: string, reason: string) {
    return this.ledgerRepository.rejectPendingRialWithdrawal(transactionId, actorId, reason);
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

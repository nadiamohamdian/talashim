import {
  BadRequestException,
  ConflictException,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import {
  LedgerSide,
  Prisma,
  WalletAssetType,
  WalletTransactionType,
} from '@/generated/prisma';
import { accountBalanceDelta } from '../constants/system-accounts';
import type { PostJournalLineDto } from '../dto/post-journal.dto';
import { LedgerRepository } from '../repositories/ledger.repository';

export interface PostJournalInput {
  reference: string;
  idempotencyKey: string;
  type: WalletTransactionType;
  userId?: string;
  description?: string;
  metadata?: Prisma.InputJsonValue;
  lines: PostJournalLineDto[];
  actorId?: string;
}

@Injectable()
export class LedgerService implements OnModuleInit {
  constructor(private readonly ledgerRepository: LedgerRepository) {}

  async onModuleInit() {
    await this.ledgerRepository.ensureSystemAccounts();
  }

  async postJournal(input: PostJournalInput) {
    const existing = await this.ledgerRepository.findExistingTransaction(
      input.idempotencyKey,
    );
    if (existing) {
      return existing;
    }

    this.validateDoubleEntry(input.lines);

    for (const line of input.lines) {
      const account = await this.ledgerRepository.findAccountByCode(line.accountCode);
      if (!account?.isActive) {
        throw new BadRequestException(`Ledger account ${line.accountCode} is unavailable`);
      }
    }

    try {
      return await this.ledgerRepository.postJournal(input);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Unique constraint failed')
      ) {
        const replay = await this.ledgerRepository.findExistingTransaction(
          input.idempotencyKey,
        );
        if (replay) return replay;
        throw new ConflictException('Duplicate journal reference');
      }
      throw error;
    }
  }

  validateDoubleEntry(lines: PostJournalLineDto[]) {
    const totals = new Map<WalletAssetType, { debit: number; credit: number }>();

    for (const line of lines) {
      const amount = Number(line.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new BadRequestException('Ledger line amount must be positive');
      }

      const bucket = totals.get(line.assetType) ?? { debit: 0, credit: 0 };
      if (line.side === LedgerSide.DEBIT) {
        bucket.debit += amount;
      } else {
        bucket.credit += amount;
      }
      totals.set(line.assetType, bucket);
    }

    for (const [assetType, bucket] of totals.entries()) {
      if (Math.abs(bucket.debit - bucket.credit) > 0.000001) {
        throw new BadRequestException(
          `Double-entry imbalance for ${assetType}: debits ${bucket.debit} != credits ${bucket.credit}`,
        );
      }
    }

    if (lines.length < 2) {
      throw new BadRequestException('Journal must contain at least two ledger lines');
    }
  }

  getAccountBalance(accountId: string) {
    return this.ledgerRepository.calculateAccountBalance(accountId);
  }

  getSignedBalance(
    category: Parameters<typeof accountBalanceDelta>[0],
    side: LedgerSide,
    amount: number,
  ) {
    return accountBalanceDelta(category, side, amount);
  }
}

import {
  LedgerAccountCategory,
  LedgerSide,
  Prisma,
  WalletAssetType,
  WalletTransactionStatus,
  WalletTransactionType,
} from '@/generated/prisma';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import {
  SYSTEM_LEDGER_ACCOUNTS,
  userWalletAccountCode,
} from '../constants/system-accounts';
import type { PostJournalLineDto } from '../dto/post-journal.dto';

@Injectable()
export class LedgerRepository {
  constructor(private readonly prisma: PrismaService) {}

  ensureSystemAccounts() {
    return Promise.all(
      SYSTEM_LEDGER_ACCOUNTS.map((account) =>
        this.prisma.ledgerAccount.upsert({
          where: { code: account.code },
          update: { name: account.name, isActive: true },
          create: account,
        }),
      ),
    );
  }

  findAccountByCode(code: string) {
    return this.prisma.ledgerAccount.findUnique({ where: { code } });
  }

  ensureUserWalletAccount(userId: string, assetType: WalletAssetType) {
    const code = userWalletAccountCode(userId, assetType);
    const name =
      assetType === WalletAssetType.RIAL
        ? 'User Rial Wallet'
        : 'User Gold Wallet';

    return this.prisma.ledgerAccount.upsert({
      where: { code },
      update: { isActive: true },
      create: {
        code,
        name,
        category: LedgerAccountCategory.LIABILITY,
        assetType,
        userId,
      },
    });
  }

  findExistingTransaction(idempotencyKey: string) {
    return this.prisma.walletTransaction.findUnique({
      where: { idempotencyKey },
      include: { entries: { include: { account: true } } },
    });
  }

  postJournal(payload: {
    reference: string;
    idempotencyKey: string;
    type: WalletTransactionType;
    userId?: string;
    description?: string;
    metadata?: Prisma.InputJsonValue;
    lines: PostJournalLineDto[];
    actorId?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const accounts = await Promise.all(
        payload.lines.map((line) =>
          tx.ledgerAccount.findUniqueOrThrow({ where: { code: line.accountCode } }),
        ),
      );

      const transaction = await tx.walletTransaction.create({
        data: {
          reference: payload.reference,
          idempotencyKey: payload.idempotencyKey,
          type: payload.type,
          status: WalletTransactionStatus.POSTED,
          description: payload.description,
          userId: payload.userId,
          metadata: payload.metadata,
          postedAt: new Date(),
          entries: {
            create: payload.lines.map((line, index) => ({
              accountId: accounts[index]!.id,
              side: line.side,
              assetType: line.assetType,
              amount: new Prisma.Decimal(line.amount),
            })),
          },
        },
        include: {
          entries: { include: { account: true } },
        },
      });

      await tx.walletAuditLog.create({
        data: {
          transactionId: transaction.id,
          actorId: payload.actorId ?? payload.userId,
          action: 'ledger.journal.posted',
          context: {
            reference: payload.reference,
            type: payload.type,
            lineCount: payload.lines.length,
          },
        },
      });

      return transaction;
    });
  }

  calculateAccountBalance(accountId: string) {
    return this.prisma.ledgerEntry
      .findMany({
        where: { accountId },
        include: { account: true },
        orderBy: { createdAt: 'asc' },
      })
      .then((entries) =>
        entries.reduce((balance, entry) => {
          const amount = Number(entry.amount);
          const delta =
            entry.account.category === LedgerAccountCategory.ASSET ||
            entry.account.category === LedgerAccountCategory.EXPENSE
              ? entry.side === LedgerSide.DEBIT
                ? amount
                : -amount
              : entry.side === LedgerSide.CREDIT
                ? amount
                : -amount;
          return balance + delta;
        }, 0),
      );
  }

  listTransactions(userId: string, skip: number, take: number) {
    return this.prisma.walletTransaction.findMany({
      where: { userId },
      include: {
        entries: { include: { account: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  countTransactions(userId: string) {
    return this.prisma.walletTransaction.count({ where: { userId } });
  }
}

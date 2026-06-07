import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  LedgerAccountCategory,
  LedgerSide,
  Prisma,
  WalletAssetType,
  WalletTransactionStatus,
  WalletTransactionType,
} from '@/generated/prisma';
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

  createPendingTransaction(payload: {
    reference: string;
    idempotencyKey: string;
    type: WalletTransactionType;
    userId: string;
    description?: string;
    metadata?: Prisma.InputJsonValue;
    actorId?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.walletTransaction.create({
        data: {
          reference: payload.reference,
          idempotencyKey: payload.idempotencyKey,
          type: payload.type,
          status: WalletTransactionStatus.PENDING,
          description: payload.description,
          userId: payload.userId,
          metadata: payload.metadata,
        },
      });

      await tx.walletAuditLog.create({
        data: {
          transactionId: transaction.id,
          actorId: payload.actorId ?? payload.userId,
          action: 'wallet.request.pending',
          context: {
            reference: payload.reference,
            type: payload.type,
          },
        },
      });

      return transaction;
    });
  }

  findTransactionById(transactionId: string) {
    return this.prisma.walletTransaction.findUnique({
      where: { id: transactionId },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        entries: { include: { account: true } },
      },
    });
  }

  completePendingRialDeposit(transactionId: string, actorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const pending = await tx.walletTransaction.findUnique({
        where: { id: transactionId },
      });

      if (!pending) {
        throw new NotFoundException('تراکنش یافت نشد');
      }
      if (pending.status !== WalletTransactionStatus.PENDING) {
        throw new BadRequestException('این درخواست در وضعیت بررسی نیست');
      }
      if (pending.type !== WalletTransactionType.DEPOSIT || !pending.userId) {
        throw new BadRequestException('درخواست واریز معتبر نیست');
      }

      const metadata = pending.metadata as Record<string, unknown> | null;
      const receiptUrl = metadata?.receiptUrl;
      const amountToman = metadata?.amountToman;
      if (typeof receiptUrl !== 'string' || typeof amountToman !== 'string') {
        throw new BadRequestException('اطلاعات فیش واریز ناقص است');
      }

      const amount = Number(amountToman);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new BadRequestException('مبلغ واریز معتبر نیست');
      }

      const userAccountCode = userWalletAccountCode(pending.userId, WalletAssetType.RIAL);
      const [platformAccount, userAccount] = await Promise.all([
        tx.ledgerAccount.findUniqueOrThrow({ where: { code: 'PLATFORM_CASH_RIAL' } }),
        tx.ledgerAccount.findUniqueOrThrow({ where: { code: userAccountCode } }),
      ]);

      const transaction = await tx.walletTransaction.update({
        where: { id: transactionId },
        data: {
          status: WalletTransactionStatus.POSTED,
          postedAt: new Date(),
          metadata: {
            ...metadata,
            approvedAt: new Date().toISOString(),
            approvedById: actorId,
          },
          entries: {
            create: [
              {
                accountId: platformAccount.id,
                side: LedgerSide.DEBIT,
                assetType: WalletAssetType.RIAL,
                amount: new Prisma.Decimal(amountToman),
              },
              {
                accountId: userAccount.id,
                side: LedgerSide.CREDIT,
                assetType: WalletAssetType.RIAL,
                amount: new Prisma.Decimal(amountToman),
              },
            ],
          },
        },
        include: {
          user: { select: { id: true, email: true, fullName: true } },
          entries: { include: { account: true } },
        },
      });

      await tx.walletAuditLog.create({
        data: {
          transactionId: transaction.id,
          actorId,
          action: 'wallet.deposit.approved',
          context: {
            amountToman,
            receiptUrl,
          },
        },
      });

      return transaction;
    });
  }

  rejectPendingRialDeposit(transactionId: string, actorId: string, reason: string) {
    return this.prisma.$transaction(async (tx) => {
      const pending = await tx.walletTransaction.findUnique({
        where: { id: transactionId },
      });

      if (!pending) {
        throw new NotFoundException('تراکنش یافت نشد');
      }
      if (pending.status !== WalletTransactionStatus.PENDING) {
        throw new BadRequestException('این درخواست در وضعیت بررسی نیست');
      }
      if (pending.type !== WalletTransactionType.DEPOSIT) {
        throw new BadRequestException('درخواست واریز معتبر نیست');
      }

      const metadata = (pending.metadata as Record<string, unknown> | null) ?? {};
      if (typeof metadata.receiptUrl !== 'string') {
        throw new BadRequestException('فیش واریز برای این درخواست یافت نشد');
      }

      const transaction = await tx.walletTransaction.update({
        where: { id: transactionId },
        data: {
          status: WalletTransactionStatus.FAILED,
          metadata: {
            ...metadata,
            rejectionReason: reason,
            rejectedAt: new Date().toISOString(),
            rejectedById: actorId,
          },
        },
        include: {
          user: { select: { id: true, email: true, fullName: true } },
          entries: { include: { account: true } },
        },
      });

      await tx.walletAuditLog.create({
        data: {
          transactionId: transaction.id,
          actorId,
          action: 'wallet.deposit.rejected',
          context: { reason },
        },
      });

      return transaction;
    });
  }
}

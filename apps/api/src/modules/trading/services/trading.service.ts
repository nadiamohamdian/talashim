import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  GoldTradeSide,
  GoldTradeStatus,
  LedgerSide,
  WalletAssetType,
  WalletTransactionType,
} from '@/generated/prisma';
import { getApiEnv } from '@/config/env';
import { userWalletAccountCode } from '@/modules/ledger/constants/system-accounts';
import { LedgerRepository } from '@/modules/ledger/repositories/ledger.repository';
import { LedgerService } from '@/modules/ledger/services/ledger.service';
import { PricingEngineService } from '@/modules/pricing/services/pricing-engine.service';
import { WalletRepository } from '@/modules/wallet/repositories/wallet.repository';
import { TRADE_AUDIT_ACTIONS } from '../constants/trade-audit-actions';
import type { MarketTradeDto } from '../dto/market-trade.dto';
import type { TradeHistoryQueryDto } from '../dto/trade-history-query.dto';
import { TradingRepository } from '../repositories/trading.repository';
import { buildTradeQuote } from '../utils/trade-quote.util';

@Injectable()
export class TradingService {
  constructor(
    private readonly tradingRepository: TradingRepository,
    private readonly walletRepository: WalletRepository,
    private readonly ledgerRepository: LedgerRepository,
    private readonly ledgerService: LedgerService,
    private readonly pricingEngine: PricingEngineService,
  ) {}

  marketBuy(payload: MarketTradeDto) {
    return this.executeMarketTrade(payload, GoldTradeSide.BUY);
  }

  marketSell(payload: MarketTradeDto) {
    return this.executeMarketTrade(payload, GoldTradeSide.SELL);
  }

  async getOrder(orderId: string) {
    const order = await this.tradingRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Trade order not found');
    }
    return this.mapOrderDetail(order);
  }

  async getOrderHistory(userId: string, query: TradeHistoryQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const filters = { side: query.side, status: query.status };

    const [items, total] = await Promise.all([
      this.tradingRepository.listOrders(userId, skip, limit, filters),
      this.tradingRepository.countOrders(userId, filters),
    ]);

    return {
      page,
      limit,
      total,
      items: items.map((item) => this.mapOrder(item)),
    };
  }

  private async executeMarketTrade(payload: MarketTradeDto, side: GoldTradeSide) {
    const existing = await this.tradingRepository.findByIdempotencyKey(
      payload.idempotencyKey,
    );
    if (existing) {
      return this.mapOrderDetail(existing);
    }

    const env = getApiEnv();
    const symbol = payload.symbol ?? 'XAU-IRR';
    const karat = payload.karat ?? 18;
    const quantityGram = Number(payload.quantityGram);

    if (!Number.isFinite(quantityGram) || quantityGram <= 0) {
      throw new BadRequestException('quantityGram must be a positive number');
    }
    if (quantityGram < env.GOLD_TRADE_MIN_GRAM) {
      throw new BadRequestException(
        `Minimum trade size is ${env.GOLD_TRADE_MIN_GRAM} gram`,
      );
    }

    await this.walletRepository.ensureUserWallets(payload.userId);

    const livePrice = await this.pricingEngine.getLivePrice(symbol, karat);
    const unitPriceToman =
      side === GoldTradeSide.BUY
        ? Number(livePrice.sellPrice)
        : Number(livePrice.buyPrice);

    const quote = buildTradeQuote({
      side,
      quantityGram,
      unitPriceToman,
      commissionPercent: env.GOLD_TRADE_COMMISSION_PERCENT,
    });

    const orderNumber = this.buildOrderNumber(side);
    const order = await this.tradingRepository.createPending({
      orderNumber,
      userId: payload.userId,
      side,
      symbol,
      karat,
      quantityGram,
      unitPriceToman,
      grossRial: quote.grossRial,
      commissionRial: quote.commissionRial,
      netRial: quote.netRial,
      commissionPercent: quote.commissionPercent,
      idempotencyKey: payload.idempotencyKey,
    });

    await this.tradingRepository.createAuditLog(
      order.id,
      TRADE_AUDIT_ACTIONS.ORDER_CREATED,
      payload.userId,
      { side, quantityGram, unitPriceToman },
    );

    try {
      await this.validateBalances(payload.userId, side, quantityGram, quote.netRial);
      await this.tradingRepository.createAuditLog(
        order.id,
        TRADE_AUDIT_ACTIONS.BALANCE_VALIDATED,
        payload.userId,
        { side },
      );

      const journal = await this.postTradeJournal({
        userId: payload.userId,
        side,
        quantityGram,
        grossRial: quote.grossRial,
        commissionRial: quote.commissionRial,
        netRial: quote.netRial,
        idempotencyKey: payload.idempotencyKey,
        orderId: order.id,
        description:
          payload.description ??
          (side === GoldTradeSide.BUY
            ? `Market buy ${quantityGram}g gold`
            : `Market sell ${quantityGram}g gold`),
      });

      const filled = await this.tradingRepository.markFilled(order.id, journal.id);
      await this.tradingRepository.createAuditLog(
        order.id,
        side === GoldTradeSide.BUY
          ? TRADE_AUDIT_ACTIONS.BUY_FILLED
          : TRADE_AUDIT_ACTIONS.SELL_FILLED,
        payload.userId,
        { walletTransactionId: journal.id },
      );

      const detail = await this.tradingRepository.findById(filled.id);
      return this.mapOrderDetail(detail!);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Trade execution failed';
      await this.tradingRepository.markFailed(order.id, message);
      await this.tradingRepository.createAuditLog(
        order.id,
        TRADE_AUDIT_ACTIONS.ORDER_FAILED,
        payload.userId,
        { reason: message },
      );
      throw error;
    }
  }

  private async validateBalances(
    userId: string,
    side: GoldTradeSide,
    quantityGram: number,
    netRial: number,
  ) {
    const codes = this.walletRepository.getUserWalletCodes(userId);

    if (side === GoldTradeSide.BUY) {
      const rialAccount = await this.ledgerRepository.findAccountByCode(codes.rial);
      if (!rialAccount) {
        throw new NotFoundException('Rial wallet not found');
      }
      const rialBalance = await this.ledgerRepository.calculateAccountBalance(
        rialAccount.id,
      );
      if (rialBalance < netRial) {
        throw new BadRequestException('Insufficient Rial balance for market buy');
      }

      const vault = await this.ledgerRepository.findAccountByCode('PLATFORM_GOLD_VAULT');
      if (!vault) {
        throw new NotFoundException('Platform gold vault not configured');
      }
      const vaultBalance = await this.ledgerRepository.calculateAccountBalance(vault.id);
      if (vaultBalance < quantityGram) {
        throw new BadRequestException('Insufficient platform gold inventory');
      }
      return;
    }

    const goldAccount = await this.ledgerRepository.findAccountByCode(codes.gold);
    if (!goldAccount) {
      throw new NotFoundException('Gold wallet not found');
    }
    const goldBalance = await this.ledgerRepository.calculateAccountBalance(
      goldAccount.id,
    );
    if (goldBalance < quantityGram) {
      throw new BadRequestException('Insufficient Gold balance for market sell');
    }

    const cash = await this.ledgerRepository.findAccountByCode('PLATFORM_CASH_RIAL');
    if (!cash) {
      throw new NotFoundException('Platform cash account not configured');
    }
    const cashBalance = await this.ledgerRepository.calculateAccountBalance(cash.id);
    if (cashBalance < netRial) {
      throw new BadRequestException('Insufficient platform Rial liquidity');
    }
  }

  private postTradeJournal(input: {
    userId: string;
    side: GoldTradeSide;
    quantityGram: number;
    grossRial: number;
    commissionRial: number;
    netRial: number;
    idempotencyKey: string;
    orderId: string;
    description: string;
  }) {
    const userRial = userWalletAccountCode(input.userId, WalletAssetType.RIAL);
    const userGold = userWalletAccountCode(input.userId, WalletAssetType.GOLD);
    const qty = input.quantityGram.toFixed(6);
    const gross = input.grossRial.toFixed(0);
    const commission = input.commissionRial.toFixed(0);
    const net = input.netRial.toFixed(0);

    if (input.side === GoldTradeSide.BUY) {
      return this.ledgerService.postJournal({
        reference: `trade-buy-${input.idempotencyKey}`,
        idempotencyKey: input.idempotencyKey,
        type: WalletTransactionType.TRADE_BUY,
        userId: input.userId,
        description: input.description,
        metadata: {
          orderId: input.orderId,
          side: input.side,
          quantityGram: qty,
          grossRial: gross,
          commissionRial: commission,
          netRial: net,
        },
        actorId: input.userId,
        lines: [
          {
            accountCode: userRial,
            side: LedgerSide.DEBIT,
            assetType: WalletAssetType.RIAL,
            amount: net,
          },
          {
            accountCode: 'PLATFORM_CASH_RIAL',
            side: LedgerSide.CREDIT,
            assetType: WalletAssetType.RIAL,
            amount: gross,
          },
          {
            accountCode: 'FEE_REVENUE_RIAL',
            side: LedgerSide.CREDIT,
            assetType: WalletAssetType.RIAL,
            amount: commission,
          },
          {
            accountCode: 'PLATFORM_GOLD_VAULT',
            side: LedgerSide.DEBIT,
            assetType: WalletAssetType.GOLD,
            amount: qty,
          },
          {
            accountCode: userGold,
            side: LedgerSide.CREDIT,
            assetType: WalletAssetType.GOLD,
            amount: qty,
          },
        ],
      });
    }

    return this.ledgerService.postJournal({
      reference: `trade-sell-${input.idempotencyKey}`,
      idempotencyKey: input.idempotencyKey,
      type: WalletTransactionType.TRADE_SELL,
      userId: input.userId,
      description: input.description,
      metadata: {
        orderId: input.orderId,
        side: input.side,
        quantityGram: qty,
        grossRial: gross,
        commissionRial: commission,
        netRial: net,
      },
      actorId: input.userId,
      lines: [
        {
          accountCode: userGold,
          side: LedgerSide.DEBIT,
          assetType: WalletAssetType.GOLD,
          amount: qty,
        },
        {
          accountCode: 'PLATFORM_GOLD_VAULT',
          side: LedgerSide.CREDIT,
          assetType: WalletAssetType.GOLD,
          amount: qty,
        },
        {
          accountCode: 'PLATFORM_CASH_RIAL',
          side: LedgerSide.DEBIT,
          assetType: WalletAssetType.RIAL,
          amount: gross,
        },
        {
          accountCode: userRial,
          side: LedgerSide.CREDIT,
          assetType: WalletAssetType.RIAL,
          amount: net,
        },
        {
          accountCode: 'FEE_REVENUE_RIAL',
          side: LedgerSide.CREDIT,
          assetType: WalletAssetType.RIAL,
          amount: commission,
        },
      ],
    });
  }

  private buildOrderNumber(side: GoldTradeSide) {
    const prefix = side === GoldTradeSide.BUY ? 'GTB' : 'GTS';
    return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
  }

  private mapOrder(order: {
    id: string;
    orderNumber: string;
    userId: string;
    side: GoldTradeSide;
    status: GoldTradeStatus;
    symbol: string;
    karat: number;
    quantityGram: { toString(): string };
    unitPriceToman: { toString(): string };
    grossRial: { toString(): string };
    commissionRial: { toString(): string };
    netRial: { toString(): string };
    commissionPercent: { toString(): string };
    walletTransactionId: string | null;
    failureReason: string | null;
    createdAt: Date;
    filledAt: Date | null;
  }) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      side: order.side,
      status: order.status,
      symbol: order.symbol,
      karat: order.karat,
      quantityGram: order.quantityGram.toString(),
      unitPriceToman: order.unitPriceToman.toString(),
      grossRial: order.grossRial.toString(),
      commissionRial: order.commissionRial.toString(),
      netRial: order.netRial.toString(),
      commissionPercent: order.commissionPercent.toString(),
      walletTransactionId: order.walletTransactionId,
      failureReason: order.failureReason,
      createdAt: order.createdAt.toISOString(),
      filledAt: order.filledAt?.toISOString() ?? null,
    };
  }

  private mapOrderDetail(order: {
    id: string;
    orderNumber: string;
    userId: string;
    side: GoldTradeSide;
    status: GoldTradeStatus;
    symbol: string;
    karat: number;
    quantityGram: { toString(): string };
    unitPriceToman: { toString(): string };
    grossRial: { toString(): string };
    commissionRial: { toString(): string };
    netRial: { toString(): string };
    commissionPercent: { toString(): string };
    walletTransactionId: string | null;
    failureReason: string | null;
    createdAt: Date;
    filledAt: Date | null;
    walletTransaction?: {
      id: string;
      reference: string;
      type: WalletTransactionType;
      status: import('@/generated/prisma').WalletTransactionStatus;
      description: string | null;
      createdAt: Date;
    } | null;
    auditLogs: Array<{
      id: string;
      action: string;
      createdAt: Date;
      context: unknown;
    }>;
  }) {
    return {
      ...this.mapOrder(order),
      transaction: order.walletTransaction
        ? {
            id: order.walletTransaction.id,
            reference: order.walletTransaction.reference,
            type: order.walletTransaction.type,
            status: order.walletTransaction.status,
            description: order.walletTransaction.description,
            createdAt: order.walletTransaction.createdAt.toISOString(),
          }
        : undefined,
      auditLogs: order.auditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        createdAt: log.createdAt.toISOString(),
        context:
          log.context && typeof log.context === 'object' && !Array.isArray(log.context)
            ? (log.context as Record<string, unknown>)
            : null,
      })),
    };
  }
}

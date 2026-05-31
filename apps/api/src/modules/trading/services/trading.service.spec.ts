import { BadRequestException } from '@nestjs/common';
import { GoldTradeSide, GoldTradeStatus } from '@/generated/prisma';
import { TradingService } from './trading.service';
import type { TradingRepository } from '../repositories/trading.repository';
import type { WalletRepository } from '@/modules/wallet/repositories/wallet.repository';
import type { LedgerRepository } from '@/modules/ledger/repositories/ledger.repository';
import type { LedgerService } from '@/modules/ledger/services/ledger.service';
import type { PricingEngineService } from '@/modules/pricing/services/pricing-engine.service';

jest.mock('@/config/env', () => ({
  getApiEnv: () => ({
    GOLD_TRADE_COMMISSION_PERCENT: 0.5,
    GOLD_TRADE_MIN_GRAM: 0.01,
  }),
}));

describe('TradingService', () => {
  let service: TradingService;
  let tradingRepository: jest.Mocked<
    Pick<
      TradingRepository,
      | 'findByIdempotencyKey'
      | 'createPending'
      | 'markFilled'
      | 'markFailed'
      | 'createAuditLog'
      | 'findById'
    >
  >;
  let walletRepository: jest.Mocked<Pick<WalletRepository, 'ensureUserWallets' | 'getUserWalletCodes'>>;
  let ledgerRepository: jest.Mocked<Pick<LedgerRepository, 'findAccountByCode' | 'calculateAccountBalance'>>;
  let ledgerService: jest.Mocked<Pick<LedgerService, 'postJournal'>>;
  let pricingEngine: jest.Mocked<Pick<PricingEngineService, 'getLivePrice'>>;

  beforeEach(() => {
    tradingRepository = {
      findByIdempotencyKey: jest.fn().mockResolvedValue(null),
      createPending: jest.fn().mockResolvedValue({
        id: 'order-1',
        orderNumber: 'GTB-TEST',
      }),
      markFilled: jest.fn().mockResolvedValue({ id: 'order-1' }),
      markFailed: jest.fn(),
      createAuditLog: jest.fn(),
      findById: jest.fn(),
    };
    walletRepository = {
      ensureUserWallets: jest.fn().mockResolvedValue([]),
      getUserWalletCodes: jest.fn().mockReturnValue({
        rial: 'USER_RIAL_u1',
        gold: 'USER_GOLD_u1',
      }),
    };
    ledgerRepository = {
      findAccountByCode: jest.fn().mockImplementation((code: string) =>
        Promise.resolve({ id: `acc-${code}`, isActive: true }),
      ),
      calculateAccountBalance: jest.fn().mockResolvedValue(100_000_000),
    };
    ledgerService = {
      postJournal: jest.fn().mockResolvedValue({ id: 'txn-1' }),
    };
    pricingEngine = {
      getLivePrice: jest.fn().mockResolvedValue({
        symbol: 'XAU-IRR',
        karat: 18,
        buyPrice: '8400000',
        sellPrice: '8600000',
        pricePerGram: '8500000',
        spreadPercent: '1.5',
        source: 'PRIMARY',
        providerName: 'primary',
        recordedAt: new Date().toISOString(),
      }),
    };

    service = new TradingService(
      tradingRepository as unknown as TradingRepository,
      walletRepository as unknown as WalletRepository,
      ledgerRepository as unknown as LedgerRepository,
      ledgerService as unknown as LedgerService,
      pricingEngine as unknown as PricingEngineService,
    );

    tradingRepository.findById.mockResolvedValue({
      id: 'order-1',
      orderNumber: 'GTB-TEST',
      userId: 'u1',
      side: GoldTradeSide.BUY,
      status: GoldTradeStatus.FILLED,
      symbol: 'XAU-IRR',
      karat: 18,
      quantityGram: { toString: () => '1' },
      unitPriceToman: { toString: () => '8600000' },
      grossRial: { toString: () => '8600000' },
      commissionRial: { toString: () => '43000' },
      netRial: { toString: () => '8643000' },
      commissionPercent: { toString: () => '0.5' },
      walletTransactionId: 'txn-1',
      failureReason: null,
      createdAt: new Date(),
      filledAt: new Date(),
      walletTransaction: {
        id: 'txn-1',
        reference: 'trade-buy-key',
        type: 'TRADE_BUY' as never,
        status: 'POSTED' as never,
        description: 'Market buy',
        createdAt: new Date(),
      },
      auditLogs: [],
    } as never);
  });

  it('rejects buy when rial balance is insufficient', async () => {
    ledgerRepository.calculateAccountBalance.mockImplementation(async (accountId: string) => {
      if (accountId === 'acc-USER_RIAL_u1') return 1000;
      return 100_000_000;
    });

    await expect(
      service.marketBuy({
        userId: 'u1',
        quantityGram: '10',
        idempotencyKey: 'buy-insufficient',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(tradingRepository.markFailed).toHaveBeenCalled();
    expect(ledgerService.postJournal).not.toHaveBeenCalled();
  });

  it('executes market buy and posts journal', async () => {
    const result = await service.marketBuy({
      userId: 'u1',
      quantityGram: '1',
      idempotencyKey: 'buy-ok-001',
    });

    expect(pricingEngine.getLivePrice).toHaveBeenCalled();
    expect(ledgerService.postJournal).toHaveBeenCalled();
    expect(tradingRepository.markFilled).toHaveBeenCalledWith('order-1', 'txn-1');
    expect(result.status).toBe(GoldTradeStatus.FILLED);
  });
});

import { BadRequestException } from '@nestjs/common';
import { WalletAssetType } from '@/generated/prisma';
import { LedgerRepository } from '@/modules/ledger/repositories/ledger.repository';
import { LedgerService } from '@/modules/ledger/services/ledger.service';
import { WalletRepository } from '../repositories/wallet.repository';
import { WalletService } from './wallet.service';

describe('WalletService', () => {
  let service: WalletService;
  let walletRepository: jest.Mocked<Pick<WalletRepository, 'ensureUserWallets' | 'getUserWalletCodes'>>;
  let ledgerService: jest.Mocked<Pick<LedgerService, 'postJournal'>>;
  let ledgerRepository: jest.Mocked<
    Pick<LedgerRepository, 'findAccountByCode' | 'calculateAccountBalance' | 'listTransactions' | 'countTransactions'>
  >;

  beforeEach(() => {
    walletRepository = {
      ensureUserWallets: jest.fn(),
      getUserWalletCodes: jest.fn().mockReturnValue({
        rial: 'USER_RIAL_u1',
        gold: 'USER_GOLD_u1',
      }),
    };
    ledgerService = {
      postJournal: jest.fn(),
    };
    ledgerRepository = {
      findAccountByCode: jest.fn(),
      calculateAccountBalance: jest.fn(),
      listTransactions: jest.fn(),
      countTransactions: jest.fn(),
    };

    service = new WalletService(
      walletRepository as unknown as WalletRepository,
      ledgerService as unknown as LedgerService,
      ledgerRepository as unknown as LedgerRepository,
    );
  });

  it('calculates wallet balances from ledger accounts', async () => {
    ledgerRepository.findAccountByCode
      .mockResolvedValueOnce({ id: 'rial-acc' } as never)
      .mockResolvedValueOnce({ id: 'gold-acc' } as never);
    ledgerRepository.calculateAccountBalance
      .mockResolvedValueOnce(1500000)
      .mockResolvedValueOnce(12.5);

    const balances = await service.getBalances('u1');

    expect(balances).toEqual({
      rialBalance: '1500000',
      goldBalanceGram: '12.500000',
    });
  });

  it('posts rial deposit journal', async () => {
    ledgerService.postJournal.mockResolvedValue({ id: 'tx-1' } as never);

    await service.depositRial({
      userId: 'u1',
      amountToman: '1000000',
      idempotencyKey: 'dep-001',
    });

    expect(ledgerService.postJournal).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotencyKey: 'dep-001',
        lines: expect.arrayContaining([
          expect.objectContaining({ accountCode: 'PLATFORM_CASH_RIAL' }),
          expect.objectContaining({ accountCode: 'USER_RIAL_u1' }),
        ]),
      }),
    );
  });

  it('rejects transfer when balance is insufficient', async () => {
    ledgerRepository.findAccountByCode.mockResolvedValue({ id: 'sender-acc' } as never);
    ledgerRepository.calculateAccountBalance.mockResolvedValue(100);

    await expect(
      service.transfer({
        userId: 'u1',
        recipientUserId: 'u2',
        assetType: WalletAssetType.RIAL,
        amount: '500',
        idempotencyKey: 'tr-001',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

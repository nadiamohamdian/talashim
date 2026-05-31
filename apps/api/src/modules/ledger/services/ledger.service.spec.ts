import { BadRequestException } from '@nestjs/common';
import { LedgerSide, WalletAssetType } from '@/generated/prisma';
import { LedgerService } from './ledger.service';
import { LedgerRepository } from '../repositories/ledger.repository';

describe('LedgerService', () => {
  let service: LedgerService;
  let repository: jest.Mocked<Pick<LedgerRepository, 'findExistingTransaction' | 'findAccountByCode' | 'postJournal' | 'ensureSystemAccounts'>>;

  beforeEach(() => {
    repository = {
      findExistingTransaction: jest.fn(),
      findAccountByCode: jest.fn(),
      postJournal: jest.fn(),
      ensureSystemAccounts: jest.fn(),
    };
    service = new LedgerService(repository as unknown as LedgerRepository);
  });

  it('rejects unbalanced journal entries', async () => {
    await expect(
      service.postJournal({
        reference: 'ref-1',
        idempotencyKey: 'key-1',
        type: 'DEPOSIT' as never,
        lines: [
          {
            accountCode: 'PLATFORM_CASH_RIAL',
            side: LedgerSide.DEBIT,
            assetType: WalletAssetType.RIAL,
            amount: '1000',
          },
          {
            accountCode: 'USER_RIAL_u1',
            side: LedgerSide.CREDIT,
            assetType: WalletAssetType.RIAL,
            amount: '900',
          },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns existing transaction for duplicate idempotency key', async () => {
    const existing = { id: 'tx-1' };
    repository.findExistingTransaction.mockResolvedValue(existing as never);

    const result = await service.postJournal({
      reference: 'ref-1',
      idempotencyKey: 'key-1',
      type: 'DEPOSIT' as never,
      lines: [
        {
          accountCode: 'PLATFORM_CASH_RIAL',
          side: LedgerSide.DEBIT,
          assetType: WalletAssetType.RIAL,
          amount: '1000',
        },
        {
          accountCode: 'USER_RIAL_u1',
          side: LedgerSide.CREDIT,
          assetType: WalletAssetType.RIAL,
          amount: '1000',
        },
      ],
    });

    expect(result).toBe(existing);
    expect(repository.postJournal).not.toHaveBeenCalled();
  });

  it('posts balanced journal entries', async () => {
    repository.findExistingTransaction.mockResolvedValue(null);
    repository.findAccountByCode.mockResolvedValue({ isActive: true } as never);
    repository.postJournal.mockResolvedValue({ id: 'tx-2' } as never);

    const result = await service.postJournal({
      reference: 'ref-2',
      idempotencyKey: 'key-2',
      type: 'DEPOSIT' as never,
      lines: [
        {
          accountCode: 'PLATFORM_CASH_RIAL',
          side: LedgerSide.DEBIT,
          assetType: WalletAssetType.RIAL,
          amount: '1000',
        },
        {
          accountCode: 'USER_RIAL_u1',
          side: LedgerSide.CREDIT,
          assetType: WalletAssetType.RIAL,
          amount: '1000',
        },
      ],
    });

    expect(result).toEqual({ id: 'tx-2' });
    expect(repository.postJournal).toHaveBeenCalledTimes(1);
  });
});

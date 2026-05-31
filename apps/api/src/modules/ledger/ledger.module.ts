import { Module } from '@nestjs/common';
import { LedgerRepository } from './repositories/ledger.repository';
import { LedgerService } from './services/ledger.service';

@Module({
  providers: [LedgerRepository, LedgerService],
  exports: [LedgerService, LedgerRepository],
})
export class LedgerModule {}

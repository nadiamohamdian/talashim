import { Module } from '@nestjs/common';
import { MediaModule } from '@/infrastructure/media/media.module';
import { LedgerModule } from '@/modules/ledger/ledger.module';
import { WalletController } from './controllers/wallet.controller';
import { WalletRepository } from './repositories/wallet.repository';
import { WalletService } from './services/wallet.service';

@Module({
  imports: [LedgerModule, MediaModule],
  controllers: [WalletController],
  providers: [WalletRepository, WalletService],
  exports: [WalletService, WalletRepository],
})
export class WalletModule {}

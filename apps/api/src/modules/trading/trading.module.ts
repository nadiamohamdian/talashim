import { Module } from '@nestjs/common';
import { LedgerModule } from '@/modules/ledger/ledger.module';
import { PricingModule } from '@/modules/pricing/pricing.module';
import { WalletModule } from '@/modules/wallet/wallet.module';
import { TradingController } from './controllers/trading.controller';
import { TradingRepository } from './repositories/trading.repository';
import { TradingService } from './services/trading.service';

@Module({
  imports: [LedgerModule, WalletModule, PricingModule],
  controllers: [TradingController],
  providers: [TradingRepository, TradingService],
  exports: [TradingService],
})
export class TradingModule {}

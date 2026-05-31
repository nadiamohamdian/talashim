import { Module } from '@nestjs/common';
import { KycController } from './controllers/kyc.controller';
import { KycRepository } from './repositories/kyc.repository';
import { KycService } from './services/kyc.service';

@Module({
  controllers: [KycController],
  providers: [KycRepository, KycService],
  exports: [KycService, KycRepository],
})
export class KycModule {}

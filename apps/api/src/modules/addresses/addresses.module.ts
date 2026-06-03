import { Module } from '@nestjs/common';
import { AddressesController } from './controllers/addresses.controller';
import { AddressesRepository } from './repositories/addresses.repository';
import { AddressesService } from './services/addresses.service';

@Module({
  controllers: [AddressesController],
  providers: [AddressesRepository, AddressesService],
  exports: [AddressesRepository],
})
export class AddressesModule {}

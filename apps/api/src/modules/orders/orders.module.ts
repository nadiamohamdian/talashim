import { Module } from '@nestjs/common';
import { AddressesModule } from '@/modules/addresses/addresses.module';
import { CartModule } from '@/modules/cart/cart.module';
import { UsersModule } from '@/modules/users/users.module';
import { WalletModule } from '@/modules/wallet/wallet.module';
import { MediaModule } from '@/infrastructure/media/media.module';
import { OrdersController, OrdersListController } from './controllers/orders.controller';
import { OrdersRepository } from './repositories/orders.repository';
import { OrdersService } from './services/orders.service';

@Module({
  imports: [CartModule, WalletModule, UsersModule, AddressesModule, MediaModule],
  controllers: [OrdersController, OrdersListController],
  providers: [OrdersRepository, OrdersService],
  exports: [OrdersService, OrdersRepository],
})
export class OrdersModule {}

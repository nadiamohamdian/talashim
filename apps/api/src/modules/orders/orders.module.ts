import { Module } from '@nestjs/common';
import { CartModule } from '@/modules/cart/cart.module';
import { OrdersController } from './controllers/orders.controller';
import { OrdersRepository } from './repositories/orders.repository';
import { OrdersService } from './services/orders.service';

@Module({
  imports: [CartModule],
  controllers: [OrdersController],
  providers: [OrdersRepository, OrdersService],
})
export class OrdersModule {}

import { Module } from '@nestjs/common';
import { CartModule } from '@/modules/cart/cart.module';
import { AdminCouponsController, CheckoutCouponsController } from './controllers/coupons.controller';
import { CouponsRepository } from './repositories/coupons.repository';
import { CouponsService } from './services/coupons.service';

@Module({
  imports: [CartModule],
  controllers: [CheckoutCouponsController, AdminCouponsController],
  providers: [CouponsRepository, CouponsService],
  exports: [CouponsService],
})
export class DiscountsModule {}

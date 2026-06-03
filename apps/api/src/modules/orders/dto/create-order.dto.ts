import { IsIn, IsOptional, IsString } from 'class-validator';
import { CHECKOUT_PAYMENT_PROVIDERS } from '@sadafgold/shared';

export class CreateOrderDto {
  @IsString()
  cartId!: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  shippingAddressId!: string;

  @IsString()
  @IsIn([...CHECKOUT_PAYMENT_PROVIDERS])
  paymentProvider!: string;
}

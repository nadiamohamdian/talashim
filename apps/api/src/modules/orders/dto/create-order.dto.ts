import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CHECKOUT_PAYMENT_PROVIDERS } from '@sadafgold/shared';

export class CreateOrderDto {
  @ApiProperty({ description: 'Cart ID to checkout' })
  @IsString()
  cartId!: string;

  @ApiProperty({ description: 'Shipping address ID' })
  @IsString()
  shippingAddressId!: string;

  @ApiProperty({
    description: 'Payment provider',
    enum: [...CHECKOUT_PAYMENT_PROVIDERS],
  })
  @IsString()
  @IsIn([...CHECKOUT_PAYMENT_PROVIDERS])
  paymentProvider!: string;

  @ApiPropertyOptional({
    description: 'Enable parcel shipping insurance',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isInsured?: boolean;

  @ApiPropertyOptional({ description: 'Optional checkout coupon code' })
  @IsOptional()
  @IsString()
  couponCode?: string;
}

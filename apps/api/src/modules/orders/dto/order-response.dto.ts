import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { OrderStatus, PaymentStatus } from '@sadafgold/types';

export class OrderSummaryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  orderNumber!: string;

  @ApiProperty()
  status!: OrderStatus;

  @ApiPropertyOptional({ nullable: true })
  paymentStatus!: PaymentStatus | null;

  @ApiProperty({ description: 'Subtotal in Toman' })
  subtotalToman!: number;

  @ApiProperty({ description: 'Tax in Toman' })
  taxToman!: number;

  @ApiProperty({ description: 'Coupon discount in Toman' })
  discountToman!: number;

  @ApiPropertyOptional({ nullable: true })
  couponCode?: string | null;

  @ApiProperty({ description: 'Whether parcel insurance is enabled' })
  isInsured!: boolean;

  @ApiProperty({ description: 'Insurance fee in Toman' })
  insuranceFeeToman!: number;

  @ApiProperty({ description: 'Total payable in Toman (includes shipping + insurance)' })
  totalToman!: number;

  @ApiProperty()
  itemCount!: number;

  @ApiProperty()
  createdAt!: string;
}

export class CreateOrderResponseDto extends OrderSummaryResponseDto {
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  items!: Array<Record<string, unknown>>;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  payments!: Array<Record<string, unknown>>;
}

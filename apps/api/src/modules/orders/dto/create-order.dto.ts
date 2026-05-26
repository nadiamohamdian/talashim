import { IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  cartId!: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  paymentProvider!: string;
}

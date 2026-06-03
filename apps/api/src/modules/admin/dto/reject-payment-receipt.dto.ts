import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectPaymentReceiptDto {
  @ApiProperty({ example: 'مبلغ واریزی با سفارش مطابقت ندارد' })
  @IsString()
  @MinLength(3)
  reason!: string;
}

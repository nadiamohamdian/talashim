import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsString, Matches, MinLength } from 'class-validator';

export class RequestRialWithdrawalDto {
  @ApiProperty({ example: '500000', description: 'Amount in Toman' })
  @IsNumberString()
  amountToman!: string;

  @ApiProperty({ example: 'IR120120000000001234567890' })
  @IsString()
  @Matches(/^IR\d{24}$/i, { message: 'شماره شبا معتبر نیست' })
  iban!: string;

  @ApiProperty({ example: 'withdraw-rial-001' })
  @IsString()
  @MinLength(8)
  idempotencyKey!: string;
}

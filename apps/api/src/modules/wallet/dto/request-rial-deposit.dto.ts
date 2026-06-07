import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsString, MinLength } from 'class-validator';

export class RequestRialDepositDto {
  @ApiProperty({ example: '1000000', description: 'Amount in Toman' })
  @IsNumberString()
  amountToman!: string;

  @ApiProperty({ example: 'deposit-rial-001' })
  @IsString()
  @MinLength(8)
  idempotencyKey!: string;
}

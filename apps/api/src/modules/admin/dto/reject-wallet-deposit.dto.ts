import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectWalletDepositDto {
  @ApiProperty({ example: 'مبلغ واریزی با درخواست مطابقت ندارد' })
  @IsString()
  @MinLength(3)
  reason!: string;
}

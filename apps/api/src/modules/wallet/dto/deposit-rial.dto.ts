import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString, MinLength } from 'class-validator';

export class DepositRialDto {
  @ApiProperty({ example: 'cluser123' })
  @IsString()
  @MinLength(3)
  userId!: string;

  @ApiProperty({ example: '1000000', description: 'Amount in Toman' })
  @IsNumberString()
  amountToman!: string;

  @ApiProperty({ example: 'deposit-rial-001' })
  @IsString()
  @MinLength(8)
  idempotencyKey!: string;

  @ApiPropertyOptional({ example: 'Bank transfer top-up' })
  @IsOptional()
  @IsString()
  description?: string;
}

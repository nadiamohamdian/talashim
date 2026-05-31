import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString, MinLength } from 'class-validator';

export class DepositGoldDto {
  @ApiProperty({ example: 'cluser123' })
  @IsString()
  @MinLength(3)
  userId!: string;

  @ApiProperty({ example: '2.500000', description: 'Gold amount in grams' })
  @IsNumberString()
  amountGram!: string;

  @ApiProperty({ example: 'deposit-gold-001' })
  @IsString()
  @MinLength(8)
  idempotencyKey!: string;

  @ApiPropertyOptional({ example: 'Physical gold deposit' })
  @IsOptional()
  @IsString()
  description?: string;
}

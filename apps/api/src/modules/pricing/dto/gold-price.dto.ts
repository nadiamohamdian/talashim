import { ApiProperty } from '@nestjs/swagger';
import { GoldPriceSource } from '@/generated/prisma';

export class LiveGoldPriceDto {
  @ApiProperty({ example: 'XAU-IRR' })
  symbol!: string;

  @ApiProperty({ example: 18 })
  karat!: number;

  @ApiProperty({ example: '8500000' })
  pricePerGram!: string;

  @ApiProperty({ example: '8437500' })
  buyPrice!: string;

  @ApiProperty({ example: '8562500' })
  sellPrice!: string;

  @ApiProperty({ example: '1.5' })
  spreadPercent!: string;

  @ApiProperty({ enum: GoldPriceSource })
  source!: GoldPriceSource;

  @ApiProperty({ example: 'primary-market' })
  providerName!: string;

  @ApiProperty()
  recordedAt!: string;
}

export class GoldPriceHistoryItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  pricePerGram!: string;

  @ApiProperty()
  buyPrice!: string;

  @ApiProperty()
  sellPrice!: string;

  @ApiProperty({ enum: GoldPriceSource })
  source!: GoldPriceSource;

  @ApiProperty()
  providerName!: string;

  @ApiProperty()
  recordedAt!: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class WalletBalanceDto {
  @ApiProperty({ example: '1500000' })
  rialBalance!: string;

  @ApiProperty({ example: '12.500000' })
  goldBalanceGram!: string;
}

export class WalletTransactionEntryDto {
  @ApiProperty()
  accountCode!: string;

  @ApiProperty()
  side!: string;

  @ApiProperty()
  assetType!: string;

  @ApiProperty()
  amount!: string;
}

export class WalletTransactionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  reference!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ type: [WalletTransactionEntryDto] })
  entries!: WalletTransactionEntryDto[];
}

export class WalletHistoryResponseDto {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty({ type: [WalletTransactionDto] })
  items!: WalletTransactionDto[];
}

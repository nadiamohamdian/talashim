import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiProtected } from '@/swagger/decorators/api-protected.decorator';
import { DepositGoldDto } from '../dto/deposit-gold.dto';
import { DepositRialDto } from '../dto/deposit-rial.dto';
import { TransferWalletDto } from '../dto/transfer-wallet.dto';
import { WalletHistoryQueryDto } from '../dto/wallet-history-query.dto';
import {
  WalletBalanceDto,
  WalletHistoryResponseDto,
  WalletTransactionDto,
} from '../dto/wallet-response.dto';
import { WalletService } from '../services/wallet.service';

@ApiTags('wallet')
@ApiProtected({ includeConflict: true })
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get(':userId/balances')
  @ApiOperation({ summary: 'Get Rial and Gold wallet balances' })
  @ApiOkResponse({ type: WalletBalanceDto })
  getBalances(@Param('userId') userId: string) {
    return this.walletService.getBalances(userId);
  }

  @Get(':userId/transactions')
  @ApiOperation({ summary: 'Get wallet transaction history' })
  @ApiOkResponse({ type: WalletHistoryResponseDto })
  getHistory(
    @Param('userId') userId: string,
    @Query() query: WalletHistoryQueryDto,
  ) {
    return this.walletService.getHistory(userId, query);
  }

  @Post('deposit/rial')
  @ApiOperation({ summary: 'Deposit Rial into user wallet' })
  @ApiOkResponse({ type: WalletTransactionDto })
  depositRial(@Body() payload: DepositRialDto) {
    return this.walletService.depositRial(payload);
  }

  @Post('deposit/gold')
  @ApiOperation({ summary: 'Deposit Gold into user wallet' })
  @ApiOkResponse({ type: WalletTransactionDto })
  depositGold(@Body() payload: DepositGoldDto) {
    return this.walletService.depositGold(payload);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer between user wallets' })
  @ApiOkResponse({ type: WalletTransactionDto })
  transfer(@Body() payload: TransferWalletDto) {
    return this.walletService.transfer(payload);
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import type { UploadedImageFile } from '@/infrastructure/media/media-storage.service';
import { ApiProtected } from '@/swagger/decorators/api-protected.decorator';
import { RequestRialDepositDto } from '../dto/request-rial-deposit.dto';
import { RequestRialWithdrawalDto } from '../dto/request-rial-withdrawal.dto';
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

  @Post('me/deposit/rial')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Submit card-to-card wallet deposit request with receipt' })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ type: WalletTransactionDto })
  @UseInterceptors(FileInterceptor('file'))
  requestRialDeposit(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: RequestRialDepositDto,
    @UploadedFile() file: UploadedImageFile | undefined,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('فایل فیش واریز ارسال نشده است');
    }
    return this.walletService.requestRialDeposit(user.id, payload, {
      buffer: file.buffer,
      mimetype: file.mimetype,
      size: file.size,
      originalname: file.originalname,
    });
  }

  @Post('me/withdraw/rial')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Submit Rial wallet withdrawal request' })
  @ApiOkResponse({ type: WalletTransactionDto })
  requestRialWithdrawal(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: RequestRialWithdrawalDto,
  ) {
    return this.walletService.requestRialWithdrawal(user.id, payload);
  }

  @Get(':userId/balances')
  @ApiOperation({ summary: 'Get Rial and Gold wallet balances' })
  @ApiOkResponse({ type: WalletBalanceDto })
  getBalances(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId') userId: string,
  ) {
    this.assertWalletOwner(user.id, userId);
    return this.walletService.getBalances(userId);
  }

  @Get(':userId/transactions')
  @ApiOperation({ summary: 'Get wallet transaction history' })
  @ApiOkResponse({ type: WalletHistoryResponseDto })
  getHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId') userId: string,
    @Query() query: WalletHistoryQueryDto,
  ) {
    this.assertWalletOwner(user.id, userId);
    return this.walletService.getHistory(userId, query);
  }

  @Post('deposit/rial')
  @ApiOperation({ summary: 'Deposit Rial into user wallet' })
  @ApiOkResponse({ type: WalletTransactionDto })
  depositRial() {
    throw new ForbiddenException('این عملیات فقط از طریق پنل مدیریت قابل انجام است');
  }

  @Post('deposit/gold')
  @ApiOperation({ summary: 'Deposit Gold into user wallet' })
  @ApiOkResponse({ type: WalletTransactionDto })
  depositGold() {
    throw new ForbiddenException('این عملیات فقط از طریق پنل مدیریت قابل انجام است');
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer between user wallets' })
  @ApiOkResponse({ type: WalletTransactionDto })
  transfer() {
    throw new ForbiddenException('این عملیات فقط از طریق پنل مدیریت قابل انجام است');
  }

  private assertWalletOwner(authenticatedUserId: string, requestedUserId: string): void {
    if (authenticatedUserId !== requestedUserId) {
      throw new ForbiddenException('دسترسی به کیف پول دیگران مجاز نیست');
    }
  }
}

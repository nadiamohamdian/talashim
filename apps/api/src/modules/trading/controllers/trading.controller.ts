import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { ApiProtected } from '@/swagger/decorators/api-protected.decorator';
import { MarketTradeDto } from '../dto/market-trade.dto';
import { TradeHistoryQueryDto } from '../dto/trade-history-query.dto';
import {
  GoldTradeHistoryResponseDto,
  GoldTradeOrderDetailDto,
} from '../dto/trade-response.dto';
import { TradingService } from '../services/trading.service';

@ApiTags('trading')
@ApiProtected({ includeConflict: true })
@Controller('trading')
export class TradingController {
  constructor(private readonly tradingService: TradingService) {}

  @Post('market/buy')
  @ApiOperation({ summary: 'Execute market buy (Rial → Gold)' })
  @ApiOkResponse({ type: GoldTradeOrderDetailDto })
  marketBuy(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: MarketTradeDto,
  ) {
    return this.tradingService.marketBuy({ ...payload, userId: user.id });
  }

  @Post('market/sell')
  @ApiOperation({ summary: 'Execute market sell (Gold → Rial)' })
  @ApiOkResponse({ type: GoldTradeOrderDetailDto })
  marketSell(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: MarketTradeDto,
  ) {
    return this.tradingService.marketSell({ ...payload, userId: user.id });
  }

  @Get('orders/:orderId')
  @ApiOperation({ summary: 'Get trade order with wallet transaction and audit trail' })
  @ApiOkResponse({ type: GoldTradeOrderDetailDto })
  getOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Param('orderId') orderId: string,
  ) {
    return this.tradingService.getOrderForUser(user.id, orderId);
  }

  @Get(':userId/orders')
  @ApiOperation({ summary: 'List gold trade order history' })
  @ApiOkResponse({ type: GoldTradeHistoryResponseDto })
  getOrderHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId') userId: string,
    @Query() query: TradeHistoryQueryDto,
  ) {
    return this.tradingService.getOrderHistoryForUser(user.id, userId, query);
  }
}

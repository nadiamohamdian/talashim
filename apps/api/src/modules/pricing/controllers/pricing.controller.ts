import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { ApiPublicErrors } from '@/swagger/decorators/api-protected.decorator';
import {
  GoldPriceHistoryItemDto,
  LiveGoldPriceDto,
} from '../dto/gold-price.dto';
import { PriceHistoryQueryDto } from '../dto/price-history-query.dto';
import { PricingEngineService } from '../services/pricing-engine.service';
import { PricingRepository } from '../repositories/pricing.repository';
import { PricingGateway } from '../gateways/pricing.gateway';

@ApiTags('pricing')
@ApiPublicErrors()
@Public()
@Controller('pricing')
export class PricingController {
  constructor(
    private readonly pricingEngine: PricingEngineService,
    private readonly pricingRepository: PricingRepository,
    private readonly pricingGateway: PricingGateway,
  ) {}

  @Get('live')
  @ApiOperation({ summary: 'Get latest live gold price (cache-backed)' })
  @ApiOkResponse({ type: LiveGoldPriceDto })
  getLive(@Query() query: PriceHistoryQueryDto) {
    return this.pricingEngine.getLivePrice(query.symbol, query.karat);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Force refresh gold price from providers' })
  @ApiOkResponse({ type: LiveGoldPriceDto })
  async refresh(@Query() query: PriceHistoryQueryDto) {
    const price = await this.pricingEngine.refreshLivePrice(
      query.symbol,
      query.karat,
    );
    this.pricingGateway.broadcastPriceUpdate(price);
    return price;
  }

  @Get('history')
  @ApiOperation({ summary: 'Get historical gold price ticks' })
  @ApiOkResponse({ type: [GoldPriceHistoryItemDto] })
  async getHistory(@Query() query: PriceHistoryQueryDto) {
    const to = new Date();
    const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
    const items = await this.pricingRepository.findHistory(
      query.symbol ?? 'XAU-IRR',
      query.karat ?? 18,
      from,
      to,
      query.limit ?? 100,
    );

    return items.map((item) => ({
      id: item.id,
      pricePerGram: item.pricePerGram.toString(),
      buyPrice: item.buyPrice.toString(),
      sellPrice: item.sellPrice.toString(),
      source: item.source,
      providerName: item.providerName,
      recordedAt: item.recordedAt.toISOString(),
    }));
  }
}

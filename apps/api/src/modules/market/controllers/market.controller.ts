import { Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { ApiPublicErrors } from '@/swagger/decorators/api-protected.decorator';
import {
  MarketCacheHealthResponseDto,
  MarketCacheInvalidateResponseDto,
} from '../dto/market-cache-health.dto';
import { MarketPricesResponseDto } from '../dto/market-prices-response.dto';
import { MarketService } from '../services/market.service';

@ApiTags('market')
@ApiPublicErrors()
@Public()
@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('prices')
  @ApiOperation({
    summary: 'Get cached market prices (gold + currency)',
    description:
      'Returns Redis-backed market prices. Fresh cache is served immediately; stale cache ' +
      'triggers background revalidation. Never calls BrsApi on every request.',
  })
  @ApiOkResponse({ type: MarketPricesResponseDto })
  getPrices() {
    return this.marketService.getPrices();
  }

  @Get('gold-price')
  @ApiOperation({
    summary: 'Get cached gold prices (alias)',
    description: 'Alias of GET /market/prices focused on gold ticker data.',
  })
  @ApiOkResponse({ type: MarketPricesResponseDto })
  getGoldPrice() {
    return this.marketService.getPrices();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Market cache health check',
    description:
      'Reports Redis connectivity and freshness of gold, currency, and snapshot cache layers.',
  })
  @ApiOkResponse({ type: MarketCacheHealthResponseDto })
  getCacheHealth() {
    return this.marketService.getCacheHealth();
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Force refresh market prices from provider',
    description: 'Invalidates cache and triggers an immediate sync from the upstream provider.',
  })
  @ApiOkResponse({ type: MarketPricesResponseDto })
  refresh() {
    return this.marketService.forceRefresh();
  }

  @Delete('cache')
  @ApiOperation({
    summary: 'Invalidate market cache',
    description: 'Removes gold, currency, snapshot, and meta keys from Redis.',
  })
  @ApiOkResponse({ type: MarketCacheInvalidateResponseDto })
  invalidateCache() {
    return this.marketService.invalidateCache('api-delete');
  }
}

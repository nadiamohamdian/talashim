import './load-env';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppThrottlerGuard } from './common/guards/app-throttler.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { HttpCacheInterceptor } from './common/interceptors/http-cache.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';
import { ResponseTimeInterceptor } from './common/interceptors/response-time.interceptor';
import { validateApiEnv } from './config/env';
import { getApiEnv } from './config/env';
import { buildThrottlerOptions } from './config/throttle.config';
import { CacheModule } from './infrastructure/cache/cache.module';
import { PrismaModule } from './infrastructure/database/prisma.module';
import { MonitoringModule } from './infrastructure/monitoring/monitoring.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { BlogModule } from './modules/blog/blog.module';
import { CartModule } from './modules/cart/cart.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { HealthModule } from './modules/health/health.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { OrdersModule } from './modules/orders/orders.module';
import { UsersModule } from './modules/users/users.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { TradingModule } from './modules/trading/trading.module';
import { AdminModule } from './modules/admin/admin.module';
import { MarketModule } from './modules/market/market.module';
import { KycModule } from './modules/kyc/kyc.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { ContactModule } from './modules/contact/contact.module';
import { MediaModule } from './infrastructure/media/media.module';
import { NotificationsModule } from './infrastructure/notifications/notifications.module';
import { SiteModule } from './modules/site/site.module';
import { CmsModule } from './modules/cms/cms.module';
import { DiscountsModule } from './modules/discounts/discounts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      validate: validateApiEnv,
    }),
    ThrottlerModule.forRoot(buildThrottlerOptions(getApiEnv())),
    PrismaModule,
    RedisModule,
    CacheModule,
    MonitoringModule,
    UsersModule,
    HealthModule,
    AuthModule,
    CatalogModule,
    InventoryModule,
    CartModule,
    OrdersModule,
    BlogModule,
    WalletModule,
    PricingModule,
    MarketModule,
    TradingModule,
    AdminModule,
    KycModule,
    AddressesModule,
    WishlistModule,
    ContactModule,
    MediaModule,
    NotificationsModule,
    SiteModule,
    CmsModule,
    DiscountsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtAuthGuard,
    {
      provide: APP_GUARD,
      useClass: AppThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestIdInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTimeInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpCacheInterceptor,
    },
  ],
})
export class AppModule {}

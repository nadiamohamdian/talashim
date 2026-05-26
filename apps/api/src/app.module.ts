import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateApiEnv } from './config/env';
import { PrismaModule } from './infrastructure/database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { BlogModule } from './modules/blog/blog.module';
import { CartModule } from './modules/cart/cart.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { HealthModule } from './modules/health/health.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { OrdersModule } from './modules/orders/orders.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      validate: validateApiEnv,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 50,
      },
    ]),
    PrismaModule,
    UsersModule,
    HealthModule,
    AuthModule,
    CatalogModule,
    InventoryModule,
    CartModule,
    OrdersModule,
    BlogModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

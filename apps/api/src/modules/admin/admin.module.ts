import { Module } from '@nestjs/common';
import { MediaModule } from '@/infrastructure/media/media.module';
import { CatalogModule } from '@/modules/catalog/catalog.module';
import { MarketModule } from '@/modules/market/market.module';
import { PricingModule } from '@/modules/pricing/pricing.module';
import { TradingModule } from '@/modules/trading/trading.module';
import { OrdersModule } from '@/modules/orders/orders.module';
import { AdminCmsController, AdminMediaController } from './controllers/admin-cms.controller';
import { AdminFinanceController } from './controllers/admin-finance.controller';
import { AdminPricingController } from './controllers/admin-pricing.controller';
import { AdminTradingController } from './controllers/admin-trading.controller';
import { AdminInventoryController } from './controllers/admin-inventory.controller';
import { AdminOrdersController } from './controllers/admin-orders.controller';
import { AdminProductsController } from './controllers/admin-products.controller';
import { AdminNotificationsController } from './controllers/admin-notifications.controller';
import { AdminController } from './controllers/admin.controller';
import { AdminSettingsController } from './controllers/admin-settings.controller';
import { AdminRbacRepository } from './repositories/admin-rbac.repository';
import { PlatformSettingsRepository } from './repositories/platform-settings.repository';
import { AdminCmsRepository } from './repositories/admin-cms.repository';
import { AdminFinanceRepository } from './repositories/admin-finance.repository';
import { AdminReportsRepository } from './repositories/admin-reports.repository';
import { AdminRepository } from './repositories/admin.repository';
import { AdminCmsService } from './services/admin-cms.service';
import { AdminFinanceService } from './services/admin-finance.service';
import { AdminPricingService } from './services/admin-pricing.service';
import { AdminTradingRepository } from './repositories/admin-trading.repository';
import { AdminInventoryRepository } from './repositories/admin-inventory.repository';
import { AdminOrdersRepository } from './repositories/admin-orders.repository';
import { AdminProductsRepository } from './repositories/admin-products.repository';
import { AdminNotificationsRepository } from './repositories/admin-notifications.repository';
import { AdminInventoryService } from './services/admin-inventory.service';
import { AdminOrdersService } from './services/admin-orders.service';
import { AdminProductsService } from './services/admin-products.service';
import { AdminNotificationsService } from './services/admin-notifications.service';
import { AdminTradingService } from './services/admin-trading.service';
import { AdminReportsService } from './services/admin-reports.service';
import { AdminRbacService } from './services/admin-rbac.service';
import { AdminSettingsService } from './services/admin-settings.service';
import { AdminService } from './services/admin.service';

@Module({
  imports: [MediaModule, CatalogModule, PricingModule, MarketModule, TradingModule, OrdersModule],
  controllers: [
    AdminController,
    AdminSettingsController,
    AdminCmsController,
    AdminMediaController,
    AdminFinanceController,
    AdminPricingController,
    AdminTradingController,
    AdminProductsController,
    AdminInventoryController,
    AdminOrdersController,
    AdminNotificationsController,
  ],
  providers: [
    AdminRepository,
    AdminRbacRepository,
    PlatformSettingsRepository,
    AdminReportsRepository,
    AdminFinanceRepository,
    AdminTradingRepository,
    AdminProductsRepository,
    AdminInventoryRepository,
    AdminOrdersRepository,
    AdminNotificationsRepository,
    AdminCmsRepository,
    AdminService,
    AdminRbacService,
    AdminSettingsService,
    AdminReportsService,
    AdminFinanceService,
    AdminTradingService,
    AdminProductsService,
    AdminInventoryService,
    AdminOrdersService,
    AdminNotificationsService,
    AdminPricingService,
    AdminCmsService,
  ],
  exports: [
    AdminService,
    AdminReportsService,
    AdminFinanceService,
    AdminTradingService,
    AdminProductsService,
    AdminInventoryService,
    AdminOrdersService,
    AdminNotificationsService,
    AdminPricingService,
    AdminCmsService,
    AdminSettingsService,
  ],
})
export class AdminModule {}

import { Module } from '@nestjs/common';
import { AdminModule } from '@/modules/admin/admin.module';
import { SiteController } from './site.controller';

@Module({
  imports: [AdminModule],
  controllers: [SiteController],
})
export class SiteModule {}

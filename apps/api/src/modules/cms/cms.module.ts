import { Module } from '@nestjs/common';
import { AdminModule } from '@/modules/admin/admin.module';
import { CmsPublicController } from './cms.controller';

@Module({
  imports: [AdminModule],
  controllers: [CmsPublicController],
})
export class CmsModule {}

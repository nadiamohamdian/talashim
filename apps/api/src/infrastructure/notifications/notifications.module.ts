import { Global, Module } from '@nestjs/common';
import { StaffInboxNotifierService } from './staff-inbox-notifier.service';

@Global()
@Module({
  providers: [StaffInboxNotifierService],
  exports: [StaffInboxNotifierService],
})
export class NotificationsModule {}

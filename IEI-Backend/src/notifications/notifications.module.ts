import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { DevNotificationsController } from './dev-notifications.controller';
import { NotificationsService } from './notifications.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [NotificationsController, DevNotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

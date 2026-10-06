import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SubscriptionsController } from './subscriptions.controller';
import { EcSubscriptionsController } from './ec-subscriptions.controller';
import { DevSubscriptionsController } from './dev-subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { PositionsGuard } from './guards/positions.guard';
import { FILE_STORAGE_SERVICE } from '../storage/file-storage.interface';
import { LocalFileStorageService } from '../storage/local-file-storage.service';

@Module({
  imports: [AuthModule, NotificationsModule],
  controllers: [
    SubscriptionsController,
    EcSubscriptionsController,
    DevSubscriptionsController,
  ],
  providers: [
    SubscriptionsService,
    PositionsGuard,
    {
      provide: FILE_STORAGE_SERVICE,
      useClass: LocalFileStorageService,
    },
  ],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}

import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { MembersController } from './members.controller';
import { MeService } from './me.service';
import { AuthModule } from '../auth/auth.module';
import { EventsModule } from '../events/events.module';
import { FILE_STORAGE_SERVICE } from '../storage/file-storage.interface';
import { LocalFileStorageService } from '../storage/local-file-storage.service';

@Module({
  imports: [AuthModule, EventsModule],
  controllers: [MeController, MembersController],
  providers: [
    MeService,
    {
      provide: FILE_STORAGE_SERVICE,
      useClass: LocalFileStorageService,
    },
  ],
})
export class MeModule {}

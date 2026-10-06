import { Module } from '@nestjs/common';
import { MembershipController } from './membership.controller';
import { MembershipService } from './membership.service';
import { FILE_STORAGE_SERVICE } from '../storage/file-storage.interface';
import { LocalFileStorageService } from '../storage/local-file-storage.service';

@Module({
  controllers: [MembershipController],
  providers: [
    MembershipService,
    {
      provide: FILE_STORAGE_SERVICE,
      useClass: LocalFileStorageService,
    },
  ],
  exports: [MembershipService],
})
export class MembershipModule {}

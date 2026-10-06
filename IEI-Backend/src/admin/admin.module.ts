import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FILE_STORAGE_SERVICE } from '../storage/file-storage.interface';
import { LocalFileStorageService } from '../storage/local-file-storage.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback-dev-secret-key-change-in-production',
    }),
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    {
      provide: FILE_STORAGE_SERVICE,
      useClass: LocalFileStorageService,
    },
  ],
  exports: [AdminService],
})
export class AdminModule {}

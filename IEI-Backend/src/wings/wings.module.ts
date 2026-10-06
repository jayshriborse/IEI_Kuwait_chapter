import { Module } from '@nestjs/common';
import { WingsController } from './wings.controller';
import { WingsService } from './wings.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [WingsController],
  providers: [WingsService],
  exports: [WingsService],
})
export class WingsModule {}

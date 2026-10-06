import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { CardTokenService } from './card-token.service';
import { EventStaffGuard } from './guards/event-staff.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [EventsController],
  providers: [EventsService, CardTokenService, EventStaffGuard],
  exports: [EventsService, CardTokenService, EventStaffGuard],
})
export class EventsModule {}


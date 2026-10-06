import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { EventsService } from './events.service';
import { CardTokenService } from './card-token.service';
import { CheckInDto, BatchSyncDto } from './dto/check-in.dto';
import { RsvpDto } from './dto/rsvp.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EventStaffGuard } from './guards/event-staff.guard';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly cardTokenService: CardTokenService,
  ) {}

  @Get()
  async getPublicEvents(
    @Query('status') status?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    return this.eventsService.getPublicEvents(status, authHeader);
  }

  @Get('card-token/public-key')
  async getPublicKey() {
    return {
      publicKey: this.cardTokenService.getPublicKeyBase64(),
      algorithm: 'Ed25519',
    };
  }

  @Get(':id/offline-pack')
  @UseGuards(JwtAuthGuard, EventStaffGuard)
  async getOfflinePack(@Param('id') id: string) {
    return this.eventsService.getOfflinePack(id);
  }

  @Get(':id')
  async getPublicEventById(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ) {
    return this.eventsService.getPublicEventById(id, authHeader);
  }

  @Post(':id/rsvp')
  @HttpCode(HttpStatus.OK)
  async rsvpToEvent(
    @Param('id') id: string,
    @Body() dto: RsvpDto,
    @Headers('authorization') authHeader?: string,
  ) {
    return this.eventsService.rsvpToEvent(id, dto, authHeader);
  }

  @Post('checkin')
  @UseGuards(JwtAuthGuard, EventStaffGuard)
  @HttpCode(HttpStatus.OK)
  async checkIn(@Body() dto: CheckInDto, @Req() req: any) {
    const staffVolunteerId = dto.volunteerMemberId || req?.user?.memberCode || req?.user?.userId;
    return this.eventsService.checkIn(dto, staffVolunteerId);
  }

  @Post('checkin/batch-sync')
  @SkipThrottle()
  @UseGuards(JwtAuthGuard, EventStaffGuard)
  @HttpCode(HttpStatus.OK)
  async batchSync(@Body() dto: BatchSyncDto, @Req() req: any) {
    const staffVolunteerId = req?.user?.memberCode || req?.user?.userId;
    return this.eventsService.batchSync(dto, staffVolunteerId);
  }

  @Get('checkin/stats')
  @UseGuards(JwtAuthGuard, EventStaffGuard)
  async getStats(@Query('eventId') eventId: string) {
    return this.eventsService.getStats(eventId);
  }

  @Get('checkin/list')
  @UseGuards(JwtAuthGuard, EventStaffGuard)
  async getList(@Query('eventId') eventId: string) {
    return this.eventsService.getAllCheckIns(eventId);
  }
}



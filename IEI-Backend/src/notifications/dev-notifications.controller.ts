import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service';
import { SeedSampleDto } from './dto/notification-query.dto';

@Controller('dev/notifications')
export class DevNotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('seed-sample')
  @HttpCode(HttpStatus.OK)
  async seedSample(@Req() req: any, @Body() dto: SeedSampleDto) {
    // Disabled unless NODE_ENV!=production and ENABLE_DEV_ENDPOINTS=true; otherwise 404
    const isDevAllowed =
      process.env.NODE_ENV !== 'production' &&
      process.env.ENABLE_DEV_ENDPOINTS === 'true';

    if (!isDevAllowed) {
      throw new NotFoundException('Cannot POST /dev/notifications/seed-sample');
    }

    // Determine target member: from body.memberCode, or from JWT bearer if provided, or default to IEI0005
    if (dto?.memberCode) {
      return this.notificationsService.seedSample(dto.memberCode, true);
    }

    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const payload: any = this.jwtService.decode(token);
        if (payload && payload.userId) {
          return this.notificationsService.seedSample(payload.userId, false);
        }
        if (payload && payload.memberCode) {
          return this.notificationsService.seedSample(payload.memberCode, true);
        }
      } catch {
        // Fallback to default
      }
    }

    // Default sample member
    return this.notificationsService.seedSample('IEI0005', true);
  }
}

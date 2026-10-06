import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SaveDeviceTokenDto, DeleteDeviceTokenDto } from './dto/device-token.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('device-token')
  @HttpCode(HttpStatus.OK)
  async saveDeviceToken(@Req() req: any, @Body() dto: SaveDeviceTokenDto) {
    return this.notificationsService.saveDeviceToken(
      req.user.userId,
      dto.token,
      dto.platform,
    );
  }

  @Delete('device-token')
  @HttpCode(HttpStatus.OK)
  async deleteDeviceToken(@Req() req: any, @Body() dto: DeleteDeviceTokenDto) {
    return this.notificationsService.deleteDeviceToken(req.user.userId, dto?.token);
  }

  @Get('notifications')
  async getNotifications(@Req() req: any, @Query() query: NotificationQueryDto) {
    return this.notificationsService.getNotifications(req.user.userId, query);
  }

  @Get('notifications/unread-count')
  async getUnreadCount(@Req() req: any) {
    return this.notificationsService.getUnreadCount(req.user.userId);
  }

  @Post('notifications/read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }

  @Post('notifications/:id/read')
  @HttpCode(HttpStatus.OK)
  async markSingleAsRead(@Req() req: any, @Param('id') id: string) {
    return this.notificationsService.markSingleAsRead(req.user.userId, id);
  }
}

import { Controller, Post, Body } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { ResetSubscriptionDto } from './dto/reset-subscription.dto';

@Controller('dev/subscriptions')
export class DevSubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('reset')
  async resetSubscription(@Body() dto: ResetSubscriptionDto) {
    return this.subscriptionsService.resetSubscription(dto.memberCode);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PositionsGuard } from './guards/positions.guard';
import { RequirePosition } from './decorators/require-position.decorator';
import { OfficePosition, DeclarationStatus } from '../generated/prisma/client';
import { SubscriptionsService } from './subscriptions.service';
import { ConfirmReceiptDto } from './dto/confirm-receipt.dto';

@Controller('ec')
@UseGuards(JwtAuthGuard, PositionsGuard)
@RequirePosition(OfficePosition.TREASURER)
export class EcSubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('receipts')
  async getReceipts(@Query('status') status?: DeclarationStatus) {
    return this.subscriptionsService.getEcReceipts(status);
  }

  @Get('receipts/:id/file')
  async getReceiptFile(@Param('id') id: string, @Res() res: any) {
    const file = await this.subscriptionsService.getEcReceiptFile(id);
    res.setHeader('Content-Type', file.mimeType);
    res.send(file.buffer);
  }

  @Post('receipts/:id/confirm')
  async confirmReceipt(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: ConfirmReceiptDto,
  ) {
    return this.subscriptionsService.confirmReceipt(req.user.userId, id, dto);
  }
}

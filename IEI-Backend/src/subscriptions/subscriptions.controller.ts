import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';
import { CreateDeclarationDto } from './dto/create-declaration.dto';
import { getChapterPaymentInstructions } from '../config/chapter-payment.config';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('subscription')
  async getSubscription(@Req() req: any) {
    return this.subscriptionsService.getCurrentSubscription(req.user.userId);
  }

  @Get('subscription/payment-instructions')
  getPaymentInstructions() {
    return getChapterPaymentInstructions();
  }

  @Post('subscription/declarations')
  @UseInterceptors(FileInterceptor('receipt'))
  async createDeclaration(
    @Req() req: any,
    @Body() dto: CreateDeclarationDto,
    @UploadedFile() file?: any,
  ) {
    return this.subscriptionsService.createDeclaration(
      req.user.userId,
      dto.method,
      file,
    );
  }

  @Get('receipts')
  async getReceipts(@Req() req: any) {
    return this.subscriptionsService.getMyReceipts(req.user.userId);
  }

  @Get('receipts/:id/file')
  async getReceiptFile(
    @Req() req: any,
    @Param('id') id: string,
    @Res() res: any,
  ) {
    const file = await this.subscriptionsService.getMyReceiptFile(
      req.user.userId,
      id,
    );
    res.setHeader('Content-Type', file.mimeType);
    res.send(file.buffer);
  }
}

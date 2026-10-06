import {
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MeService } from './me.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Patch, Body } from '@nestjs/common';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  async getProfile(@Req() req: any) {
    return this.meService.getProfile(req.user.userId);
  }

  @Get('profile')
  async getProfileExplicit(@Req() req: any) {
    return this.meService.getProfile(req.user.userId);
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.meService.updateProfile({ userId: req.user.userId }, dto);
  }

  @Get('card')
  async getCard(@Req() req: any) {
    return this.meService.getCard(req.user.userId);
  }

  @Get('card-token')
  async getCardToken(@Req() req: any) {
    return this.meService.getCardToken(req.user.userId);
  }

  @Post('photo')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('photo'))
  async uploadPhoto(
    @Req() req: any,
    @UploadedFile() file: any,
  ) {
    return this.meService.uploadPhoto(req.user.userId, file);
  }

  @Get('photo')
  async getPhoto(@Req() req: any, @Res() res: any) {
    const photo = await this.meService.getPhoto(req.user.userId);
    res.setHeader('Content-Type', photo.mimeType);
    res.send(photo.buffer);
  }
}

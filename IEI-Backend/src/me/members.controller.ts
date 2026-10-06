import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MeService } from './me.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('members')
export class MembersController {
  constructor(private readonly meService: MeService) {}

  @Get()
  async getAllMembers() {
    return this.meService.getAllMembers();
  }

  @Get(':memberCode/profile')
  async getProfile(@Param('memberCode') memberCode: string) {
    return this.meService.getProfileByCode(memberCode);
  }

  @Get(':memberCode')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  async getMemberByCode(@Param('memberCode') memberCode: string) {
    return this.meService.getProfileByCode(memberCode);
  }

  @Patch(':memberCode/profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Param('memberCode') memberCode: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.meService.updateProfile({ memberCode }, dto);
  }

  @Post(':memberCode/profile')
  @HttpCode(HttpStatus.OK)
  async postUpdateProfile(
    @Param('memberCode') memberCode: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.meService.updateProfile({ memberCode }, dto);
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { WingsService } from './wings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateWingPostDto } from './dto/create-wing-post.dto';
import { UpdateWingPostDto } from './dto/update-wing-post.dto';
import { AssignConvenorDto } from './dto/assign-convenor.dto';

@Controller('wings')
@UseGuards(JwtAuthGuard)
export class WingsController {
  constructor(private readonly wingsService: WingsService) {}

  /**
   * Helper to ensure caller has a linked member account.
   */
  private checkLinkedMember(req: any) {
    if (!req.user || !req.user.memberCode || !req.user.userId) {
      throw new ForbiddenException(
        'Access denied: wing spaces require a linked member account',
      );
    }
  }

  /**
   * GET /wings - list all wings and convenor status.
   */
  @Get()
  async getWings(@Req() req: any) {
    this.checkLinkedMember(req);
    return this.wingsService.getWings(req.user.userId);
  }

  /**
   * GET /wings/:slug/posts - list posts for a wing feed (newest first).
   */
  @Get(':slug/posts')
  async getWingPosts(@Param('slug') slug: string, @Req() req: any) {
    this.checkLinkedMember(req);
    return this.wingsService.getWingPosts(slug, req.user.userId);
  }

  /**
   * POST /wings/:slug/posts - create a post in a wing feed.
   * Only active convenor of THAT wing or ADMIN.
   */
  @Post(':slug/posts')
  @HttpCode(HttpStatus.CREATED)
  async createWingPost(
    @Param('slug') slug: string,
    @Body() dto: CreateWingPostDto,
    @Req() req: any,
  ) {
    this.checkLinkedMember(req);
    return this.wingsService.createWingPost(
      slug,
      req.user.userId,
      req.user.memberCode,
      dto,
    );
  }

  /**
   * PATCH /wings/posts/:id - update a post.
   * Only the author convenor of that wing or ADMIN.
   */
  @Patch('posts/:id')
  async updateWingPost(
    @Param('id') id: string,
    @Body() dto: UpdateWingPostDto,
    @Req() req: any,
  ) {
    this.checkLinkedMember(req);
    return this.wingsService.updateWingPost(
      id,
      req.user.userId,
      req.user.memberCode,
      dto,
    );
  }

  /**
   * DELETE /wings/posts/:id - soft delete a post.
   * Only the author convenor of that wing or ADMIN.
   */
  @Delete('posts/:id')
  @HttpCode(HttpStatus.OK)
  async deleteWingPost(@Param('id') id: string, @Req() req: any) {
    this.checkLinkedMember(req);
    return this.wingsService.deleteWingPost(
      id,
      req.user.userId,
      req.user.memberCode,
    );
  }

  /**
   * POST /wings/:slug/convenors - assign convenor to wing (ADMIN or EC only).
   */
  @Post(':slug/convenors')
  @HttpCode(HttpStatus.CREATED)
  async assignConvenor(
    @Param('slug') slug: string,
    @Body() dto: AssignConvenorDto,
    @Req() req: any,
  ) {
    this.checkLinkedMember(req);
    return this.wingsService.assignConvenor(
      slug,
      req.user.userId,
      req.user.memberCode,
      dto,
    );
  }

  /**
   * DELETE /wings/:slug/convenors/:memberId - remove convenor (ADMIN or EC only).
   */
  @Delete(':slug/convenors/:memberId')
  @HttpCode(HttpStatus.OK)
  async removeConvenor(
    @Param('slug') slug: string,
    @Param('memberId') memberId: string,
    @Req() req: any,
  ) {
    this.checkLinkedMember(req);
    return this.wingsService.removeConvenor(
      slug,
      memberId,
      req.user.userId,
      req.user.memberCode,
    );
  }
}

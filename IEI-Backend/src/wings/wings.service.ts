import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType, OfficePosition } from '../generated/prisma/client';
import { CreateWingPostDto } from './dto/create-wing-post.dto';
import { UpdateWingPostDto } from './dto/update-wing-post.dto';
import { AssignConvenorDto } from './dto/assign-convenor.dto';

@Injectable()
export class WingsService {
  private readonly logger = new Logger(WingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check if member is ADMIN or has an active EC office bearer assignment.
   */
  async isCallerAdminOrEc(userId: string, memberCode?: string | null): Promise<boolean> {
    if (memberCode === 'IEI9000' || memberCode === 'ADMIN') {
      return true;
    }

    const member = await this.prisma.member.findUnique({
      where: { id: userId },
      select: { memberCode: true },
    });
    if (member && (member.memberCode === 'IEI9000' || member.memberCode === 'ADMIN')) {
      return true;
    }

    const assignment = await this.prisma.officeBearerAssignment.findFirst({
      where: {
        memberId: userId,
        position: {
          in: [
            OfficePosition.TREASURER,
            OfficePosition.GENERAL_SECRETARY,
            OfficePosition.CHAIRMAN,
            OfficePosition.EC_VOLUNTEER,
          ],
        },
        active: true,
      },
    });

    return Boolean(assignment);
  }

  /**
   * Check if caller is an active convenor of a specific wing.
   */
  async isConvenorOfWing(userId: string, wingId: string): Promise<boolean> {
    const convenor = await this.prisma.wingConvenor.findFirst({
      where: {
        memberId: userId,
        wingId,
        active: true,
      },
    });
    return Boolean(convenor);
  }

  /**
   * List all wings with their active convenors.
   */
  async getWings(userId: string) {
    const wings = await this.prisma.wing.findMany({
      orderBy: { name: 'asc' },
      include: {
        convenors: {
          where: { active: true },
          include: {
            member: {
              select: {
                id: true,
                memberCode: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    // Check if the caller is a convenor for each wing
    return wings.map((w) => ({
      ...w,
      isCurrentUserConvenor: w.convenors.some((c) => c.memberId === userId),
    }));
  }

  /**
   * Get posts for a specific wing by slug (newest first, soft-deleted excluded).
   */
  async getWingPosts(slug: string, userId: string) {
    const wing = await this.prisma.wing.findUnique({
      where: { slug },
      include: {
        convenors: {
          where: { active: true },
          include: {
            member: {
              select: { id: true, memberCode: true, fullName: true },
            },
          },
        },
      },
    });

    if (!wing) {
      throw new NotFoundException(`Wing '${slug}' not found`);
    }

    const posts = await this.prisma.wingPost.findMany({
      where: {
        wingId: wing.id,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            memberCode: true,
            fullName: true,
          },
        },
      },
    });

    const isConvenor = wing.convenors.some((c) => c.memberId === userId);

    return {
      wing: {
        id: wing.id,
        slug: wing.slug,
        name: wing.name,
        isCurrentUserConvenor: isConvenor,
        convenors: wing.convenors.map((c) => ({
          memberId: c.memberId,
          memberCode: c.member.memberCode,
          fullName: c.member.fullName,
          assignedAt: c.assignedAt,
        })),
      },
      posts,
    };
  }

  /**
   * Create a post in a wing feed.
   * Only an active convenor of THAT wing (or ADMIN) can post.
   * Convenor of another wing gets 403.
   * Generates a WING_POST notification for all linked members.
   */
  async createWingPost(
    slug: string,
    userId: string,
    memberCode: string | null,
    dto: CreateWingPostDto,
  ) {
    const wing = await this.prisma.wing.findUnique({
      where: { slug },
    });

    if (!wing) {
      throw new NotFoundException(`Wing '${slug}' not found`);
    }

    const isAdmin = memberCode === 'IEI9000' || memberCode === 'ADMIN';
    const isWingConvenor = await this.isConvenorOfWing(userId, wing.id);

    if (!isAdmin && !isWingConvenor) {
      throw new ForbiddenException(
        `Access denied: only an active convenor of ${wing.name} or an ADMIN may post here`,
      );
    }

    const post = await this.prisma.wingPost.create({
      data: {
        wingId: wing.id,
        authorMemberId: userId,
        title: dto.title,
        body: dto.body,
        eventDate: dto.eventDate ? new Date(dto.eventDate) : null,
        imageKey: dto.imageKey || null,
      },
      include: {
        author: {
          select: { id: true, memberCode: true, fullName: true },
        },
        wing: {
          select: { id: true, slug: true, name: true },
        },
      },
    });

    // Create WING_POST notification for all linked members
    try {
      const linkedMembers = await this.prisma.member.findMany({
        where: {
          authIdentities: {
            some: {},
          },
        },
        select: { id: true },
      });

      if (linkedMembers.length > 0) {
        await this.prisma.notification.createMany({
          data: linkedMembers.map((m) => ({
            memberId: m.id,
            type: NotificationType.WING_POST,
            title: `${wing.name} posted an activity`,
            body: post.title,
          })),
        });
      }
    } catch (err: any) {
      this.logger.error(`Failed to fan out wing post notification: ${err?.message || err}`);
    }

    return post;
  }

  /**
   * Edit a wing post.
   * Only the author convenor of that wing or ADMIN can edit.
   */
  async updateWingPost(
    postId: string,
    userId: string,
    memberCode: string | null,
    dto: UpdateWingPostDto,
  ) {
    const post = await this.prisma.wingPost.findFirst({
      where: {
        id: postId,
        deletedAt: null,
      },
      include: {
        wing: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found or has been deleted');
    }

    const isAdmin = memberCode === 'IEI9000' || memberCode === 'ADMIN';
    const isAuthor = post.authorMemberId === userId;
    const isConvenor = await this.isConvenorOfWing(userId, post.wingId);

    if (!isAdmin && (!isAuthor || !isConvenor)) {
      throw new ForbiddenException(
        'Access denied: only the author convenor of this post or an ADMIN may edit it',
      );
    }

    return this.prisma.wingPost.update({
      where: { id: postId },
      data: {
        title: dto.title !== undefined ? dto.title : undefined,
        body: dto.body !== undefined ? dto.body : undefined,
        eventDate: dto.eventDate !== undefined ? (dto.eventDate ? new Date(dto.eventDate) : null) : undefined,
        imageKey: dto.imageKey !== undefined ? dto.imageKey : undefined,
      },
      include: {
        author: {
          select: { id: true, memberCode: true, fullName: true },
        },
        wing: {
          select: { id: true, slug: true, name: true },
        },
      },
    });
  }

  /**
   * Soft delete a wing post.
   * Only the author convenor of that wing or ADMIN can delete.
   */
  async deleteWingPost(postId: string, userId: string, memberCode: string | null) {
    const post = await this.prisma.wingPost.findFirst({
      where: {
        id: postId,
        deletedAt: null,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found or has already been deleted');
    }

    const isAdmin = memberCode === 'IEI9000' || memberCode === 'ADMIN';
    const isAuthor = post.authorMemberId === userId;
    const isConvenor = await this.isConvenorOfWing(userId, post.wingId);

    if (!isAdmin && (!isAuthor || !isConvenor)) {
      throw new ForbiddenException(
        'Access denied: only the author convenor of this post or an ADMIN may delete it',
      );
    }

    await this.prisma.wingPost.update({
      where: { id: postId },
      data: { deletedAt: new Date() },
    });

    return {
      success: true,
      message: 'Post deleted successfully',
    };
  }

  /**
   * Assign a convenor to a wing (ADMIN or EC only).
   */
  async assignConvenor(
    slug: string,
    callerId: string,
    callerMemberCode: string | null,
    dto: AssignConvenorDto,
  ) {
    const isAuthorized = await this.isCallerAdminOrEc(callerId, callerMemberCode);
    if (!isAuthorized) {
      throw new ForbiddenException('Access denied: only ADMIN or EC officers may assign convenors');
    }

    const wing = await this.prisma.wing.findUnique({
      where: { slug },
    });
    if (!wing) {
      throw new NotFoundException(`Wing '${slug}' not found`);
    }

    let targetMember = null;
    if (dto.memberId) {
      targetMember = await this.prisma.member.findUnique({ where: { id: dto.memberId } });
    } else if (dto.memberCode) {
      targetMember = await this.prisma.member.findUnique({
        where: { memberCode: dto.memberCode.toUpperCase() },
      });
    }

    if (!targetMember) {
      throw new NotFoundException('Target member not found');
    }

    return this.prisma.wingConvenor.upsert({
      where: {
        memberId_wingId: {
          memberId: targetMember.id,
          wingId: wing.id,
        },
      },
      update: {
        active: true,
        assignedBy: callerId,
        assignedAt: new Date(),
      },
      create: {
        memberId: targetMember.id,
        wingId: wing.id,
        assignedBy: callerId,
        assignedAt: new Date(),
        active: true,
      },
      include: {
        member: {
          select: { id: true, memberCode: true, fullName: true },
        },
        wing: {
          select: { id: true, slug: true, name: true },
        },
      },
    });
  }

  /**
   * Remove a convenor from a wing (ADMIN or EC only).
   */
  async removeConvenor(
    slug: string,
    targetMemberIdOrCode: string,
    callerId: string,
    callerMemberCode: string | null,
  ) {
    const isAuthorized = await this.isCallerAdminOrEc(callerId, callerMemberCode);
    if (!isAuthorized) {
      throw new ForbiddenException('Access denied: only ADMIN or EC officers may remove convenors');
    }

    const wing = await this.prisma.wing.findUnique({
      where: { slug },
    });
    if (!wing) {
      throw new NotFoundException(`Wing '${slug}' not found`);
    }

    let targetMember = await this.prisma.member.findUnique({
      where: { id: targetMemberIdOrCode },
    });
    if (!targetMember) {
      targetMember = await this.prisma.member.findUnique({
        where: { memberCode: targetMemberIdOrCode.toUpperCase() },
      });
    }

    if (!targetMember) {
      throw new NotFoundException('Target member not found');
    }

    const convenor = await this.prisma.wingConvenor.findUnique({
      where: {
        memberId_wingId: {
          memberId: targetMember.id,
          wingId: wing.id,
        },
      },
    });

    if (!convenor) {
      throw new NotFoundException('Convenor assignment not found');
    }

    await this.prisma.wingConvenor.update({
      where: {
        memberId_wingId: {
          memberId: targetMember.id,
          wingId: wing.id,
        },
      },
      data: { active: false },
    });

    return {
      success: true,
      message: 'Convenor removed successfully',
    };
  }
}

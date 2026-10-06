import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { OfficePosition } from '../../generated/prisma/client';
import { REQUIRE_POSITION_KEY } from '../decorators/require-position.decorator';

@Injectable()
export class PositionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPosition = this.reflector.getAllAndOverride<OfficePosition>(
      REQUIRE_POSITION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPosition) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.userId) {
      throw new ForbiddenException('Access denied: unauthenticated user');
    }

    // Check an ACTIVE assignment in the database on every request
    const assignment = await this.prisma.officeBearerAssignment.findFirst({
      where: {
        memberId: user.userId,
        position: requiredPosition,
        active: true,
      },
    });

    if (!assignment) {
      throw new ForbiddenException(
        `Forbidden resource: requires active ${requiredPosition} position`,
      );
    }

    return true;
  }
}

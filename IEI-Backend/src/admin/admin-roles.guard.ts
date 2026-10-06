import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { ADMIN_ROLES_KEY, AllowedAdminRole } from './admin-roles.decorator';
import { OfficePosition } from '../generated/prisma/client';

@Injectable()
export class AdminRolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<AllowedAdminRole[]>(
      ADMIN_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new UnauthorizedException('Authentication required to access administrative resource');
    }

    // Look up active office bearer assignments for this member
    const member = await this.prisma.member.findUnique({
      where: { id: user.userId },
      include: {
        officeBearerAssignments: {
          where: { active: true },
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('Access denied: verified member record required');
    }

    const userPositions: OfficePosition[] = member.officeBearerAssignments.map(
      (a) => a.position,
    );

    const isSystemAdmin =
      member.memberCode === 'IEI9000' ||
      member.memberCode === 'ADMIN' ||
      userPositions.includes(OfficePosition.CHAIRMAN);

    // If ADMIN is allowed and caller is system admin or chairman
    if (requiredRoles.includes('ADMIN') && isSystemAdmin) {
      return true;
    }

    // Check if any of the user's positions match required roles
    const hasMatchingPosition = requiredRoles.some((role) => {
      if (role === 'ADMIN') return false;
      return userPositions.includes(role as OfficePosition);
    });

    if (hasMatchingPosition) {
      return true;
    }

    throw new ForbiddenException(
      `Access denied: requires one of the following administrative roles: ${requiredRoles.join(', ')}`,
    );
  }
}

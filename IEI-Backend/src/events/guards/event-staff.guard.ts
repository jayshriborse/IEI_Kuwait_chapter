import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OfficePosition } from '../../generated/prisma/client';

@Injectable()
export class EventStaffGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new UnauthorizedException('Authentication required to access door check-in');
    }

    // Check if user has an active EC Volunteer, EC Officer, or Chairman position
    const assignment = await this.prisma.officeBearerAssignment.findFirst({
      where: {
        memberId: user.userId,
        position: {
          in: [
            OfficePosition.EC_VOLUNTEER,
            OfficePosition.TREASURER,
            OfficePosition.GENERAL_SECRETARY,
            OfficePosition.CHAIRMAN,
          ],
        },
        active: true,
      },
    });

    if (assignment) {
      return true;
    }

    // Check if user is an ADMIN (check if member exists and has admin privileges if applicable)
    const member = await this.prisma.member.findUnique({
      where: { id: user.userId },
    });

    if (member && (member.memberCode === 'IEI9000' || member.memberCode === 'ADMIN')) {
      return true;
    }

    throw new ForbiddenException(
      'Access denied: event door check-in requires EC volunteer, EC officer or ADMIN role',
    );
  }
}

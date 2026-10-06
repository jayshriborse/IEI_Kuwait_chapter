import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (request.url?.includes('/wings')) {
        throw new ForbiddenException('Linked member account required: guests cannot access wing spaces');
      }
      throw new UnauthorizedException('Authentication token required');
    }

    const token = authHeader.substring(7);

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'fallback-dev-secret-key-change-in-production',
      });
      if (request.url?.includes('/wings') && !payload.memberCode) {
        throw new ForbiddenException('Linked member account required: unlinked accounts cannot access wing spaces');
      }
      request.user = {
        userId: payload.sub,
        authIdentityId: payload.authIdentityId,
        memberCode: payload.memberCode,
      };
      return true;
    } catch (err) {
      if (err instanceof ForbiddenException) {
        throw err;
      }
      if (request.url?.includes('/wings')) {
        throw new ForbiddenException('Invalid token: linked member account required');
      }
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }
}

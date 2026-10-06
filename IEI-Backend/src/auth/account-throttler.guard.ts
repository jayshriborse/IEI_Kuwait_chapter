import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class AccountThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const user = req.user;
    if (user && (user.authIdentityId || user.userId)) {
      return `account:${user.authIdentityId || user.userId}`;
    }
    const authHeader = req.headers?.authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return `token:${authHeader.substring(7, 32)}`;
    }
    return req.ip || 'anonymous';
  }
}

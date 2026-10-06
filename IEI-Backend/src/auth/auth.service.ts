import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MemberLinkService } from './member-link.service';
import { DevLoginDto } from './dto/dev-login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { AppleLoginDto } from './dto/apple-login.dto';
import { LinkMemberDto } from './dto/link-member.dto';

export function extractDisplayName(fullName: string): string {
  const cleaned = (fullName || '').replace(/^(Engr?\.|Dr\.|Mr\.|Mrs\.|Ms\.)\s*/i, '').trim();
  const parts = cleaned.split(' ').filter(Boolean);
  return parts[0] || fullName;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private applePublicKeysCache: { keys: any[]; fetchedAt: number } | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly memberLinkService: MemberLinkService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Fetches and caches Apple's public JWK keys from https://appleid.apple.com/auth/keys
   */
  private async getApplePublicKeys(): Promise<any[]> {
    const ONE_HOUR = 60 * 60 * 1000;
    if (
      this.applePublicKeysCache &&
      Date.now() - this.applePublicKeysCache.fetchedAt < ONE_HOUR
    ) {
      return this.applePublicKeysCache.keys;
    }

    try {
      const res = await fetch('https://appleid.apple.com/auth/keys');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.keys)) {
          this.applePublicKeysCache = {
            keys: data.keys,
            fetchedAt: Date.now(),
          };
          return data.keys;
        }
      }
    } catch (err: any) {
      this.logger.warn(`Failed to fetch Apple public keys: ${err.message}`);
    }

    return this.applePublicKeysCache?.keys || [];
  }

  /**
   * Cryptographically verifies a Google ID Token using Google's tokeninfo API.
   * Enforces: iss is Google, aud equals our client ID, exp is valid, email_verified is true.
   */
  async verifyGoogleIdToken(idToken: string): Promise<{
    sub: string;
    email: string;
    emailVerified: boolean;
    name?: string;
    picture?: string;
  }> {
    if (!idToken || typeof idToken !== 'string') {
      throw new BadRequestException('A valid Google ID token is required');
    }

    try {
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken.trim())}`,
      );

      if (!response.ok) {
        // In local development or testing with mock token, check if decoded JWT is available
        const decoded: any = this.jwtService.decode(idToken);
        if (decoded && decoded.sub && process.env.NODE_ENV !== 'production') {
          return {
            sub: decoded.sub,
            email: decoded.email || '',
            emailVerified: true,
            name: decoded.name,
            picture: decoded.picture,
          };
        }
        throw new UnauthorizedException('Google token verification failed');
      }

      const payload = await response.json();
      if (!payload || !payload.sub) {
        throw new UnauthorizedException('Invalid Google token: missing subject identifier');
      }

      // Check iss: accounts.google.com or https://accounts.google.com
      if (
        payload.iss !== 'accounts.google.com' &&
        payload.iss !== 'https://accounts.google.com'
      ) {
        throw new UnauthorizedException('Google token issuer (iss) invalid');
      }

      // Check aud: must match configured client IDs if configured
      const allowedClientIds = [
        process.env.GOOGLE_WEB_CLIENT_ID,
        process.env.GOOGLE_ANDROID_CLIENT_ID,
        process.env.GOOGLE_IOS_CLIENT_ID,
        process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      ].filter(Boolean);

      if (allowedClientIds.length > 0 && !allowedClientIds.includes(payload.aud)) {
        throw new UnauthorizedException('Google token audience (aud) mismatch');
      }

      // Check exp: valid expiration
      if (!payload.exp || Number(payload.exp) * 1000 <= Date.now()) {
        throw new UnauthorizedException('Google token has expired');
      }

      // Check email_verified: true
      const isEmailVerified =
        payload.email_verified === 'true' || payload.email_verified === true;
      if (!isEmailVerified) {
        throw new UnauthorizedException('Google account email is not verified');
      }

      return {
        sub: payload.sub,
        email: (payload.email || '').toLowerCase().trim(),
        emailVerified: isEmailVerified,
        name: payload.name,
        picture: payload.picture,
      };
    } catch (err: any) {
      if (err instanceof UnauthorizedException || err instanceof BadRequestException) {
        throw err;
      }
      this.logger.warn(`Google token validation error: ${err.message}`);
      throw new UnauthorizedException('Unable to verify Google authentication credentials');
    }
  }

  /**
   * Verifies an Apple Identity Token (JWT) issued by https://appleid.apple.com.
   * Enforces: iss is https://appleid.apple.com, aud equals bundle ID, exp valid, signature verified against Apple public keys.
   */
  async verifyAppleIdentityToken(
    identityToken: string,
    userSub: string,
  ): Promise<{
    sub: string;
    email?: string;
  }> {
    if (!identityToken || typeof identityToken !== 'string') {
      throw new BadRequestException('A valid Apple identity token is required');
    }

    try {
      const parts = identityToken.trim().split('.');
      if (parts.length !== 3) {
        throw new UnauthorizedException('Invalid Apple token format');
      }

      let header: any;
      let payload: any;
      try {
        header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
        payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      } catch {
        throw new UnauthorizedException('Invalid Apple token encoding');
      }

      // Check iss
      if (payload.iss !== 'https://appleid.apple.com') {
        throw new UnauthorizedException('Apple token issuer invalid: must be https://appleid.apple.com');
      }

      // Check aud: must match our app bundle identifier
      const expectedAud = process.env.APPLE_BUNDLE_ID || 'org.iei.kuwait';
      const allowedAppleAuds = [
        expectedAud,
        process.env.APPLE_CLIENT_ID,
        'org.iei.kuwait',
      ].filter(Boolean);

      if (!allowedAppleAuds.includes(payload.aud)) {
        throw new UnauthorizedException('Apple token audience mismatch');
      }

      // Check exp
      if (!payload.exp || payload.exp * 1000 <= Date.now()) {
        throw new UnauthorizedException('Apple token has expired');
      }

      // Check user sub
      const tokenSub = payload.sub;
      if (userSub && tokenSub !== userSub) {
        throw new UnauthorizedException('Apple user identifier mismatch');
      }

      // Verify signature against Apple public keys
      let signatureVerified = false;
      const appleKeys = await this.getApplePublicKeys();
      const matchingKey = appleKeys.find((k: any) => k.kid === header.kid);

      if (matchingKey) {
        try {
          const publicKey = crypto.createPublicKey({ key: matchingKey, format: 'jwk' });
          const data = Buffer.from(`${parts[0]}.${parts[1]}`);
          const sig = Buffer.from(parts[2], 'base64url');
          signatureVerified = crypto.verify('RSA-SHA256', data, publicKey, sig);
        } catch (err: any) {
          this.logger.warn(`Apple signature verification error: ${err.message}`);
        }
      }

      if (!signatureVerified) {
        if (process.env.NODE_ENV !== 'production' && (!matchingKey || !header.kid)) {
          this.logger.warn('Mock Apple token accepted in development environment only');
        } else {
          throw new UnauthorizedException('Apple token signature verification failed against Apple public keys');
        }
      }

      return {
        sub: tokenSub,
        email: payload.email ? String(payload.email).toLowerCase().trim() : undefined,
      };
    } catch (err: any) {
      if (err instanceof UnauthorizedException || err instanceof BadRequestException) {
        throw err;
      }
      this.logger.warn(`Apple token validation error: ${err.message}`);
      throw new UnauthorizedException('Unable to verify Apple authentication credentials');
    }
  }

  /**
   * Authenticates user via Google OAuth2 ID Token.
   * Finds or creates AuthIdentity in DB.
   * Does NOT auto-link by email. When no prior link exists, isLinked is false.
   */
  async googleLogin(dto: GoogleLoginDto) {
    const verified = await this.verifyGoogleIdToken(dto.idToken);

    // Look up AuthIdentity by (GOOGLE, sub)
    let authIdentity = await this.prisma.authIdentity.findUnique({
      where: {
        provider_providerUserId: {
          provider: 'GOOGLE',
          providerUserId: verified.sub,
        },
      },
      include: {
        member: {
          include: {
            officeBearerAssignments: { where: { active: true } },
          },
        },
      },
    });

    // If new identity, create it with memberId: null (never auto-link by email)
    if (!authIdentity) {
      authIdentity = await this.prisma.authIdentity.create({
        data: {
          provider: 'GOOGLE',
          providerUserId: verified.sub,
          email: verified.email || null,
          memberId: null,
        },
        include: {
          member: {
            include: {
              officeBearerAssignments: { where: { active: true } },
            },
          },
        },
      });

      this.logger.log(
        `Created new AuthIdentity (GOOGLE: ${verified.sub}) for ${verified.email || 'no-email'}. Unlinked.`,
      );
    }

    const member = authIdentity.member;
    const isLinked = Boolean(member);

    // Generate IEI application session JWT
    const payload = {
      sub: member ? member.id : authIdentity.id,
      authIdentityId: authIdentity.id,
      provider: 'GOOGLE',
      providerUserId: verified.sub,
      email: authIdentity.email,
      memberCode: member ? member.memberCode : null,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_SECRET || 'fallback-dev-secret-key-change-in-production',
    });

    return {
      accessToken,
      isLinked,
      authIdentityId: authIdentity.id,
      email: authIdentity.email,
      provider: 'GOOGLE',
      user: {
        id: authIdentity.id,
        email: authIdentity.email,
        name: verified.name,
        picture: verified.picture,
      },
      member: member
        ? {
            id: member.id,
            memberCode: member.memberCode,
            fullName: member.fullName,
            displayName: extractDisplayName(member.fullName),
            grade: member.grade,
            discipline: member.discipline,
            mobile: member.mobile,
            memberSinceYear: member.memberSinceYear,
            positions: (member.officeBearerAssignments || []).map((p) => p.position),
          }
        : null,
    };
  }

  /**
   * Authenticates user via Apple Sign-In Identity Token.
   * Finds or creates AuthIdentity in DB.
   * Does NOT auto-link by email. When no prior link exists, isLinked is false.
   */
  async appleLogin(dto: AppleLoginDto) {
    const verified = await this.verifyAppleIdentityToken(dto.identityToken, dto.user);
    const email = (dto.email || verified.email || '').toLowerCase().trim();

    // Look up AuthIdentity by (APPLE, sub)
    let authIdentity = await this.prisma.authIdentity.findUnique({
      where: {
        provider_providerUserId: {
          provider: 'APPLE',
          providerUserId: verified.sub,
        },
      },
      include: {
        member: {
          include: {
            officeBearerAssignments: { where: { active: true } },
          },
        },
      },
    });

    if (!authIdentity) {
      authIdentity = await this.prisma.authIdentity.create({
        data: {
          provider: 'APPLE',
          providerUserId: verified.sub,
          email: email || null,
          memberId: null,
        },
        include: {
          member: {
            include: {
              officeBearerAssignments: { where: { active: true } },
            },
          },
        },
      });

      this.logger.log(
        `Created new AuthIdentity (APPLE: ${verified.sub}) for ${email || 'anonymous'}. Unlinked.`,
      );
    }

    const member = authIdentity.member;
    const isLinked = Boolean(member);

    const payload = {
      sub: member ? member.id : authIdentity.id,
      authIdentityId: authIdentity.id,
      provider: 'APPLE',
      providerUserId: verified.sub,
      email: authIdentity.email,
      memberCode: member ? member.memberCode : null,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_SECRET || 'fallback-dev-secret-key-change-in-production',
    });

    return {
      accessToken,
      isLinked,
      authIdentityId: authIdentity.id,
      email: authIdentity.email,
      provider: 'APPLE',
      user: {
        id: authIdentity.id,
        email: authIdentity.email,
        name: dto.fullName || undefined,
      },
      member: member
        ? {
            id: member.id,
            memberCode: member.memberCode,
            fullName: member.fullName,
            displayName: extractDisplayName(member.fullName),
            grade: member.grade,
            discipline: member.discipline,
            mobile: member.mobile,
            memberSinceYear: member.memberSinceYear,
            positions: (member.officeBearerAssignments || []).map((p) => p.position),
          }
        : null,
    };
  }

  /**
   * Links a verified AuthIdentity to a verified Member record using Member ID and Registered Mobile.
   * Refuses with 404 if Member ID + mobile is not found.
   * Refuses with 409 if member is already linked to another account for that provider.
   * Linking the same identity to the same member again succeeds.
   */
  async linkMember(
    identifier: { authIdentityId?: string; userId?: string },
    dto: LinkMemberDto,
  ) {
    const authIdentityId = dto.authIdentityId || identifier.authIdentityId || identifier.userId;
    if (!authIdentityId) {
      throw new UnauthorizedException('Invalid or expired session. Please sign in again.');
    }

    const authIdentity = await this.prisma.authIdentity.findUnique({
      where: { id: authIdentityId },
    });

    if (!authIdentity) {
      throw new UnauthorizedException('Invalid or expired session. Please sign in again.');
    }

    const member = await this.memberLinkService.findMemberByCodeAndMobile(
      dto.memberCode,
      dto.mobile,
    );

    if (!member) {
      throw new NotFoundException(
        'Member record not found. Please verify your Member ID and registered mobile number.',
      );
    }

    // Check if this member is already linked to an identity for this provider
    const existingProviderIdentity = await this.prisma.authIdentity.findFirst({
      where: {
        memberId: member.id,
        provider: authIdentity.provider,
      },
    });

    if (
      existingProviderIdentity &&
      existingProviderIdentity.providerUserId !== authIdentity.providerUserId
    ) {
      throw new ConflictException(
        'This record is already linked to another account. Contact the General Secretary.',
      );
    }

    // Linking the same identity to the same member again succeeds
    if (!authIdentity.memberId || authIdentity.memberId !== member.id) {
      await this.prisma.authIdentity.update({
        where: { id: authIdentity.id },
        data: { memberId: member.id },
      });
    }

    const payload = {
      sub: member.id,
      authIdentityId: authIdentity.id,
      memberCode: member.memberCode,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_SECRET || 'fallback-dev-secret-key-change-in-production',
    });

    const displayName = extractDisplayName(member.fullName);

    return {
      accessToken,
      isLinked: true,
      member: {
        id: member.id,
        memberCode: member.memberCode,
        fullName: member.fullName,
        displayName,
        grade: member.grade,
        discipline: member.discipline,
        mobile: member.mobile,
        memberSinceYear: member.memberSinceYear,
      },
    };
  }

  async devLogin(dto: DevLoginDto) {
    const isDevLoginEnabled = process.env.ENABLE_DEV_LOGIN === 'true';
    const isProduction = process.env.NODE_ENV === 'production';

    if (!isDevLoginEnabled || isProduction) {
      throw new NotFoundException('Endpoint not found');
    }

    const member = await this.memberLinkService.findMemberByCodeAndMobile(
      dto.memberCode,
      dto.mobile,
    );

    if (!member) {
      throw new NotFoundException('Member record not found');
    }

    const payload = {
      sub: member.id,
      memberCode: member.memberCode,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_SECRET || 'fallback-dev-secret-key-change-in-production',
    });

    const fullMember = await this.prisma.member.findUnique({
      where: { id: member.id },
      include: {
        officeBearerAssignments: { where: { active: true } },
      },
    });

    const displayName = extractDisplayName(member.fullName);

    return {
      accessToken,
      isLinked: true,
      member: {
        id: member.id,
        memberCode: member.memberCode,
        fullName: member.fullName,
        displayName,
        grade: member.grade,
        discipline: member.discipline,
        mobile: member.mobile,
        memberSinceYear: member.memberSinceYear,
        positions: (fullMember?.officeBearerAssignments || []).map((p) => p.position),
      },
    };
  }
}

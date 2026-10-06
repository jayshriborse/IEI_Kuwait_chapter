import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface NormalizedMatchInput {
  normalizedCode: string;
  normalizedMobile: string;
}

@Injectable()
export class MemberLinkService {
  constructor(private readonly prisma: PrismaService) {}

  normalize(memberCode: string, mobile: string): NormalizedMatchInput {
    const normalizedCode = (memberCode || '').trim().toUpperCase();
    const normalizedMobile = (mobile || '').trim().replace(/\D/g, '');
    return { normalizedCode, normalizedMobile };
  }

  async findMemberByCodeAndMobile(memberCode: string, mobile: string) {
    const { normalizedCode, normalizedMobile } = this.normalize(memberCode, mobile);
    if (!normalizedCode || !normalizedMobile) {
      return null;
    }

    const member = await this.prisma.member.findFirst({
      where: {
        memberCode: normalizedCode,
        mobile: normalizedMobile,
      },
    });

    return member;
  }
}

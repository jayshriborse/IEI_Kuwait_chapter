import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CardTokenService } from '../events/card-token.service';
import { extractDisplayName } from '../auth/auth.service';
import {
  FILE_STORAGE_SERVICE,
  FileStorageService,
} from '../storage/file-storage.interface';

import { UpdateProfileDto } from './dto/update-profile.dto';

export function detectImageExtensionFromMagicBytes(buffer: Buffer): string | null {
  if (!buffer || buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'png';
  }

  // WEBP: RIFF .... WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'webp';
  }

  return null;
}

@Injectable()
export class MeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly cardTokenService: CardTokenService,
    @Inject(FILE_STORAGE_SERVICE)
    private readonly fileStorage: any,
  ) {}

  async getProfile(userId: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: userId },
      include: {
        officeBearerAssignments: {
          where: { active: true },
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member profile not found');
    }

    const currentYear = new Date().getFullYear();
    const memberSinceYear = member.memberSinceYear || currentYear;
    const yearsAMember = Math.max(0, currentYear - memberSinceYear);
    const displayName = extractDisplayName(member.fullName);
    const hasPhoto = Boolean(member.photoKey);
    const positions = (member.officeBearerAssignments || []).map((a) => a.position);

    return {
      memberCode: member.memberCode,
      fullName: member.fullName,
      displayName,
      grade: member.grade,
      discipline: member.discipline,
      mobile: member.mobile,
      bloodGroup: member.bloodGroup,
      ieiIndiaNo: member.ieiIndiaNo,
      memberSinceYear,
      yearsAMember,
      hasPhoto,
      company: member.company,
      designation: member.designation,
      governorate: member.governorate,
      sector: member.sector,
      areaLocality: member.areaLocality,
      familyStatus: member.familyStatus,
      familyMembersCount: member.familyMembersCount,
      positions,
    };
  }

  async getProfileByCode(memberCode: string) {
    const member = await this.prisma.member.findUnique({
      where: { memberCode: memberCode.toUpperCase() },
      include: {
        officeBearerAssignments: {
          where: { active: true },
        },
      },
    });
    if (!member) {
      throw new NotFoundException(`Member profile not found for code: ${memberCode}`);
    }
    const positions = (member.officeBearerAssignments || []).map((a) => a.position);
    return {
      memberCode: member.memberCode,
      fullName: member.fullName,
      displayName: extractDisplayName(member.fullName),
      grade: member.grade,
      discipline: member.discipline,
      mobile: member.mobile,
      bloodGroup: member.bloodGroup,
      ieiIndiaNo: member.ieiIndiaNo,
      memberSinceYear: member.memberSinceYear,
      hasPhoto: Boolean(member.photoKey),
      company: member.company,
      designation: member.designation,
      governorate: member.governorate,
      sector: member.sector,
      areaLocality: member.areaLocality,
      familyStatus: member.familyStatus,
      familyMembersCount: member.familyMembersCount,
      positions,
    };
  }

  async getAllMembers() {
    const members = await this.prisma.member.findMany({
      include: {
        officeBearerAssignments: {
          where: { active: true },
        },
      },
      orderBy: { memberCode: 'asc' },
    });

    return members.map((member) => {
      const positions = (member.officeBearerAssignments || []).map((a) => a.position);
      return {
        memberCode: member.memberCode,
        fullName: member.fullName,
        displayName: extractDisplayName(member.fullName),
        grade: member.grade,
        discipline: member.discipline,
        mobile: member.mobile,
        bloodGroup: member.bloodGroup,
        ieiIndiaNo: member.ieiIndiaNo,
        memberSinceYear: member.memberSinceYear,
        hasPhoto: Boolean(member.photoKey),
        company: member.company,
        designation: member.designation,
        governorate: member.governorate,
        sector: member.sector,
        areaLocality: member.areaLocality,
        familyStatus: member.familyStatus,
        familyMembersCount: member.familyMembersCount,
        positions,
      };
    });
  }

  async updateProfile(
    identifier: { userId?: string; memberCode?: string },
    dto: UpdateProfileDto,
  ) {
    let member = null;
    if (identifier.userId) {
      member = await this.prisma.member.findUnique({
        where: { id: identifier.userId },
      });
    } else if (identifier.memberCode) {
      member = await this.prisma.member.findUnique({
        where: { memberCode: identifier.memberCode.toUpperCase() },
      });
    }

    if (!member) {
      throw new NotFoundException('Member profile not found');
    }

    const updated = await this.prisma.member.update({
      where: { id: member.id },
      data: {
        company: dto.company !== undefined ? dto.company : member.company,
        designation: dto.designation !== undefined ? dto.designation : member.designation,
        governorate: dto.governorate !== undefined ? dto.governorate : member.governorate,
        sector: dto.sector !== undefined ? dto.sector : member.sector,
        areaLocality: dto.areaLocality !== undefined ? dto.areaLocality : member.areaLocality,
        familyStatus: dto.familyStatus !== undefined ? dto.familyStatus : member.familyStatus,
        familyMembersCount: dto.familyMembersCount !== undefined ? dto.familyMembersCount : member.familyMembersCount,
      },
    });

    return {
      success: true,
      message: 'Profile updated successfully',
      data: {
        memberCode: updated.memberCode,
        fullName: updated.fullName,
        company: updated.company,
        designation: updated.designation,
        governorate: updated.governorate,
        sector: updated.sector,
        areaLocality: updated.areaLocality,
        familyStatus: updated.familyStatus,
        familyMembersCount: updated.familyMembersCount,
      },
    };
  }

  async getCard(userId: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: userId },
    });

    if (!member) {
      throw new NotFoundException('Member profile not found');
    }

    const currentYear = new Date().getFullYear();
    const memberSinceYear = member.memberSinceYear || currentYear;
    const hasPhoto = Boolean(member.photoKey);

    // Signed Ed25519 QR card token for member
    const cardToken = this.cardTokenService.generateCardToken(member.memberCode);

    return {
      fullName: member.fullName,
      discipline: member.discipline,
      memberSinceYear,
      grade: member.grade,
      bloodGroup: member.bloodGroup,
      memberCode: member.memberCode,
      ieiIndiaNo: member.ieiIndiaNo,
      hasPhoto,
      cardToken,
      qrToken: cardToken,
    };
  }

  async getCardToken(userId: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: userId },
    });

    if (!member) {
      throw new NotFoundException('Member profile not found');
    }

    const cardToken = this.cardTokenService.generateCardToken(member.memberCode);
    return {
      cardToken,
      memberCode: member.memberCode,
      expiresIn: '365d',
    };
  }

  async uploadPhoto(userId: string, file: { buffer: Buffer; [key: string]: any }) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Image file is required under field "photo"');
    }

    // Check 5 MB size limit
    if (file.buffer.length > 5 * 1024 * 1024) {
      throw new BadRequestException('Image file size exceeds maximum limit of 5 MB');
    }

    // Inspect real file magic bytes
    const ext = detectImageExtensionFromMagicBytes(file.buffer);
    if (!ext) {
      throw new BadRequestException(
        'Invalid image file format signature. Only JPEG, PNG, and WEBP images are allowed.',
      );
    }

    const member = await this.prisma.member.findUnique({
      where: { id: userId },
    });

    if (!member) {
      throw new NotFoundException('Member profile not found');
    }

    let mimeType = 'image/jpeg';
    if (ext === 'png') mimeType = 'image/png';
    if (ext === 'webp') mimeType = 'image/webp';

    const photoKey = await (this.fileStorage as FileStorageService).savePhoto({
      memberId: member.id,
      buffer: file.buffer,
      extension: ext,
      mimeType,
    });

    const updated = await this.prisma.member.update({
      where: { id: member.id },
      data: {
        photoKey,
        photoUpdatedAt: new Date(),
      },
    });

    return {
      message: 'Photo uploaded successfully',
      hasPhoto: true,
      photoKey: updated.photoKey,
      photoUpdatedAt: updated.photoUpdatedAt,
    };
  }

  async getPhoto(userId: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: userId },
    });

    if (!member || !member.photoKey) {
      throw new NotFoundException('Member photo not found');
    }

    const result = await (this.fileStorage as FileStorageService).getPhotoBuffer(member.photoKey);
    if (!result) {
      throw new NotFoundException('Photo file not found in storage');
    }

    return result;
  }
}

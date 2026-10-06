import {
  Injectable,
  Logger,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import {
  FILE_STORAGE_SERVICE,
  FileStorageService,
} from '../storage/file-storage.interface';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UploadDocumentDto, VALID_DOCUMENT_TYPES, ValidDocumentType } from './dto/upload-document.dto';
import { DocumentType, ApplicationStatus } from '../generated/prisma/client';

export interface MembershipInfo {
  chapter: string;
  establishedYear: number;
  annualDuesKd: number;
  grades: { grade: string; title: string; description: string }[];
  requiredDocuments: string[];
  reviewStages: string[];
}

@Injectable()
export class MembershipService {
  private readonly logger = new Logger(MembershipService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(FILE_STORAGE_SERVICE)
    private readonly fileStorageService: any,
  ) {}

  getMembershipInformation(): MembershipInfo {
    return {
      chapter: 'The Institution of Engineers (India) — Kuwait Chapter',
      establishedYear: 1995,
      annualDuesKd: 20,
      grades: [
        {
          grade: 'FIE',
          title: 'Fellow',
          description: 'Senior corporate members with extensive leadership and distinguished practice.',
        },
        {
          grade: 'MIE',
          title: 'Member',
          description: 'Corporate engineers with accredited degree and professional engineering experience.',
        },
        {
          grade: 'AMIE',
          title: 'Associate Member',
          description: 'Early-to-mid career graduate engineers and AMIE graduates.',
        },
        {
          grade: 'SMIE',
          title: 'Senior Member',
          description: 'Specialized grade for experienced engineering professionals.',
        },
        {
          grade: 'TIE',
          title: 'Technician Member',
          description: 'Diploma engineers pursuing advancement.',
        },
      ],
      requiredDocuments: [
        'Degree Certificate (Engineering)',
        'Passport Copy',
        'Civil ID Copy',
        'Recent Photograph',
      ],
      reviewStages: [
        '1. Application & Documents Intake',
        '2. General Secretary Credential Review',
        '3. Chapter Chairman Endorsement',
        '4. IEI Headquarters Kolkata Ratification',
        '5. Member ID Allocation & Digital Card Activation',
      ],
    };
  }

  /**
   * Initializes or restores a draft application for document uploads.
   */
  async getOrCreateDraftApplication(params: {
    applicationId?: string;
    applicantToken?: string;
    fullName?: string;
    mobile?: string;
    email?: string;
  }) {
    if (params.applicationId) {
      const existing = await this.prisma.membershipApplication.findFirst({
        where: {
          OR: [{ id: params.applicationId }, { applicationNumber: params.applicationId }],
        },
        include: { documents: true },
      });

      if (existing) {
        if (
          params.applicantToken &&
          existing.applicantToken &&
          existing.applicantToken !== params.applicantToken
        ) {
          throw new ForbiddenException('Unauthorized access to application draft');
        }

        return {
          applicationId: existing.id,
          applicationNumber: existing.applicationNumber,
          applicantToken: existing.applicantToken,
          status: existing.status,
          documents: existing.documents.map((d) => ({
            id: d.id,
            documentType: d.documentType,
            originalFileName: d.originalFileName,
            fileSize: d.fileSize,
            mimeType: d.mimeType,
            uploadedAt: d.uploadedAt,
          })),
        };
      }
    }

    const applicationNumber = `APP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const applicantToken = `tok_${crypto.randomBytes(16).toString('hex')}`;

    const created = await this.prisma.membershipApplication.create({
      data: {
        applicationNumber,
        applicantToken,
        fullName: params.fullName || 'Draft Applicant',
        mobile: params.mobile || 'Draft',
        email: params.email || null,
        discipline: 'Engineering',
        employer: 'Kuwait Employer',
        designation: 'Engineer',
        qualification: 'Engineering Degree',
        status: ApplicationStatus.DRAFT,
      },
      include: { documents: true },
    });

    return {
      applicationId: created.id,
      applicationNumber: created.applicationNumber,
      applicantToken: created.applicantToken,
      status: created.status,
      documents: [],
    };
  }

  /**
   * Uploads and stores a verified membership document.
   */
  async uploadDocument(
    applicationId: string,
    dto: UploadDocumentDto,
    file: any,
    callerToken?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }

    // Maximum 10 MB per file
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new BadRequestException('File size exceeds the 10 MB limit.');
    }

    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const allowedExts = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];
    if (!allowedExts.includes(ext)) {
      throw new BadRequestException('Invalid file type. Only PDF, JPG, and PNG documents are allowed.');
    }

    // Photograph must be an image
    if (dto.documentType === 'PHOTOGRAPH' && !file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Passport Size Photograph must be an image (JPG or PNG).');
    }

    // Lookup or auto-create application draft if needed
    let app = await this.prisma.membershipApplication.findFirst({
      where: {
        OR: [{ id: applicationId }, { applicationNumber: applicationId }],
      },
    });

    const token = dto.applicantToken || callerToken;

    if (!app) {
      // Auto-create draft application with this ID if not exists
      const applicationNumber = `APP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      app = await this.prisma.membershipApplication.create({
        data: {
          id: applicationId.includes('-') && applicationId.length === 36 ? applicationId : undefined,
          applicationNumber,
          applicantToken: token || `tok_${crypto.randomBytes(16).toString('hex')}`,
          fullName: 'Applicant',
          mobile: 'Draft',
          discipline: 'Engineering',
          employer: 'Kuwait Employer',
          designation: 'Engineer',
          qualification: 'Engineering Degree',
          status: ApplicationStatus.DRAFT,
        },
      });
    } else {
      if (app.applicantToken && token && app.applicantToken !== token) {
        throw new ForbiddenException('Unauthorized access: Invalid applicant token for this application.');
      }
    }

    // Save file binary securely in local file storage
    const storageKey = await this.fileStorageService.saveMembershipDocument({
      applicationId: app.id,
      documentType: dto.documentType,
      buffer: file.buffer,
      extension: ext,
      mimeType: file.mimetype,
    });

    // Upsert database record (replaces previous file for this documentType)
    const doc = await this.prisma.membershipDocument.upsert({
      where: {
        applicationId_documentType: {
          applicationId: app.id,
          documentType: dto.documentType as DocumentType,
        },
      },
      create: {
        applicationId: app.id,
        documentType: dto.documentType as DocumentType,
        originalFileName: file.originalname,
        storageKey,
        mimeType: file.mimetype,
        fileSize: file.size,
      },
      update: {
        originalFileName: file.originalname,
        storageKey,
        mimeType: file.mimetype,
        fileSize: file.size,
        uploadedAt: new Date(),
      },
    });

    this.logger.log(
      `Uploaded document ${dto.documentType} (${file.originalname}) for application ${app.applicationNumber}`,
    );

    return {
      success: true,
      message: 'Document uploaded successfully',
      document: {
        id: doc.id,
        documentType: doc.documentType,
        originalFileName: doc.originalFileName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        uploadedAt: doc.uploadedAt,
      },
    };
  }

  /**
   * Retrieves list of uploaded documents for an application.
   */
  async getApplicationDocuments(applicationId: string, callerToken?: string) {
    const app = await this.prisma.membershipApplication.findFirst({
      where: {
        OR: [{ id: applicationId }, { applicationNumber: applicationId }],
      },
      include: {
        documents: {
          orderBy: { uploadedAt: 'asc' },
        },
      },
    });

    if (!app) {
      return {
        applicationId,
        status: 'DRAFT',
        documents: [],
      };
    }

    if (callerToken && app.applicantToken && callerToken !== app.applicantToken) {
      throw new ForbiddenException('Unauthorized to view documents for this application.');
    }

    return {
      applicationId: app.id,
      applicationNumber: app.applicationNumber,
      status: app.status,
      documents: app.documents.map((d) => ({
        id: d.id,
        documentType: d.documentType,
        originalFileName: d.originalFileName,
        fileSize: d.fileSize,
        mimeType: d.mimeType,
        uploadedAt: d.uploadedAt,
      })),
    };
  }

  /**
   * Removes an uploaded document from storage and database.
   */
  async deleteDocument(applicationId: string, documentTypeStr: string, callerToken?: string) {
    const app = await this.prisma.membershipApplication.findFirst({
      where: {
        OR: [{ id: applicationId }, { applicationNumber: applicationId }],
      },
    });

    if (!app) {
      throw new NotFoundException('Application not found');
    }

    if (callerToken && app.applicantToken && callerToken !== app.applicantToken) {
      throw new ForbiddenException('Unauthorized to modify this application');
    }

    const doc = await this.prisma.membershipDocument.findUnique({
      where: {
        applicationId_documentType: {
          applicationId: app.id,
          documentType: documentTypeStr as DocumentType,
        },
      },
    });

    if (doc) {
      await this.fileStorageService.deleteMembershipDocument(doc.storageKey);
      await this.prisma.membershipDocument.delete({
        where: { id: doc.id },
      });
    }

    return {
      success: true,
      removedType: documentTypeStr,
    };
  }

  /**
   * Retrieves secure file stream for viewing/previewing.
   */
  async getDocumentFile(applicationId: string, documentId: string, callerToken?: string) {
    const app = await this.prisma.membershipApplication.findFirst({
      where: {
        OR: [{ id: applicationId }, { applicationNumber: applicationId }],
      },
    });

    if (!app) {
      throw new NotFoundException('Application not found');
    }

    if (callerToken && app.applicantToken && callerToken !== app.applicantToken) {
      throw new ForbiddenException('Unauthorized to access this document');
    }

    const doc = await this.prisma.membershipDocument.findFirst({
      where: {
        id: documentId,
        applicationId: app.id,
      },
    });

    if (!doc) {
      throw new NotFoundException('Document record not found');
    }

    const file = await this.fileStorageService.getMembershipDocumentBuffer(doc.storageKey);
    if (!file) {
      throw new NotFoundException('File binary not found in storage');
    }

    return {
      buffer: file.buffer,
      mimeType: doc.mimeType,
      fileName: doc.originalFileName,
    };
  }

  /**
   * Submits application and validates that all 4 mandatory documents are uploaded.
   */
  async submitApplication(dto: CreateApplicationDto, callerToken?: string) {
    const fullName = dto.fullName || dto.applicantName || 'Applicant';
    const mobile = dto.mobile || dto.applicantMobile || '';
    const email = dto.email || dto.applicantEmail || '';

    let app: any = null;
    const token = dto.applicantToken || callerToken;

    if (dto.applicationId) {
      app = await this.prisma.membershipApplication.findFirst({
        where: {
          OR: [{ id: dto.applicationId }, { applicationNumber: dto.applicationId }],
        },
        include: { documents: true },
      });
    }

    if (!app && token) {
      app = await this.prisma.membershipApplication.findFirst({
        where: { applicantToken: token },
        include: { documents: true },
      });
    }

    if (!app) {
      // Create new application record
      const applicationNumber = `APP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      app = await this.prisma.membershipApplication.create({
        data: {
          applicationNumber,
          applicantToken: token || `tok_${crypto.randomBytes(16).toString('hex')}`,
          fullName,
          mobile,
          email: email || null,
          discipline: dto.discipline,
          employer: dto.employer,
          designation: dto.designation,
          qualification: dto.qualification,
          experienceYears: String(dto.experienceYears || '5'),
          referredBy: dto.referredBy || null,
          status: ApplicationStatus.DRAFT,
        },
        include: { documents: true },
      });
    }

    // Backend verification of all 4 mandatory document types
    const docs = await this.prisma.membershipDocument.findMany({
      where: { applicationId: app.id },
    });

    const uploadedTypes = new Set(docs.map((d) => d.documentType));
    const missing = VALID_DOCUMENT_TYPES.filter((t) => !uploadedTypes.has(t as DocumentType));

    if (missing.length > 0) {
      const missingLabels = missing.map((m) => {
        switch (m) {
          case 'DEGREE_CERTIFICATE':
            return 'Degree Certificate';
          case 'PASSPORT_COPY':
            return 'Passport Copy';
          case 'CIVIL_ID':
            return 'Civil ID Copy';
          case 'PHOTOGRAPH':
            return 'Passport Size Photograph';
          default:
            return m;
        }
      });
      throw new BadRequestException(
        `Please upload all 4 required documents before submitting: ${missingLabels.join(', ')}`,
      );
    }

    // All 4 documents verified -> update to AWAITING_REVIEW
    const updated = await this.prisma.membershipApplication.update({
      where: { id: app.id },
      data: {
        fullName,
        mobile,
        email: email || null,
        discipline: dto.discipline,
        employer: dto.employer,
        designation: dto.designation,
        experienceYears: String(dto.experienceYears || '5'),
        qualification: dto.qualification,
        referredBy: dto.referredBy || null,
        status: ApplicationStatus.AWAITING_REVIEW,
      },
    });

    this.logger.log(
      `Membership application ${updated.applicationNumber} submitted successfully with 4 verified documents`,
    );

    return {
      success: true,
      applicationId: updated.applicationNumber,
      status: 'AWAITING_REVIEW',
      message: 'Your membership application has been received with all 4 required documents and forwarded for scrutiny.',
      applicant: {
        fullName,
        mobile,
        email,
        discipline: dto.discipline,
        employer: dto.employer,
        designation: dto.designation,
        qualification: dto.qualification,
        experienceYears: String(dto.experienceYears || '5'),
      },
      documentsCount: docs.length,
    };
  }
}

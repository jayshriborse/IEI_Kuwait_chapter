import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Headers,
  Res,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { MembershipService } from './membership.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Controller('membership')
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Get('information')
  getMembershipInformation() {
    return this.membershipService.getMembershipInformation();
  }

  /**
   * Initializes or restores a draft application session
   */
  @Post(['applications/draft', 'draft'])
  @HttpCode(HttpStatus.OK)
  async getOrCreateDraft(
    @Body() body: { applicationId?: string; applicantToken?: string; fullName?: string; mobile?: string; email?: string },
    @Headers('x-applicant-token') tokenHeader?: string,
  ) {
    return this.membershipService.getOrCreateDraftApplication({
      ...body,
      applicantToken: body.applicantToken || tokenHeader,
    });
  }

  /**
   * Uploads a document to the application
   */
  @Post(['applications/:applicationId/documents', '../membership-applications/:applicationId/documents'])
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Param('applicationId') applicationId: string,
    @Body() dto: UploadDocumentDto,
    @UploadedFile() file: any,
    @Headers('x-applicant-token') tokenHeader?: string,
  ) {
    return this.membershipService.uploadDocument(
      applicationId,
      dto,
      file,
      dto.applicantToken || tokenHeader,
    );
  }

  /**
   * Retrieves all uploaded documents for an application
   */
  @Get(['applications/:applicationId/documents', '../membership-applications/:applicationId/documents'])
  async getApplicationDocuments(
    @Param('applicationId') applicationId: string,
    @Headers('x-applicant-token') tokenHeader?: string,
  ) {
    return this.membershipService.getApplicationDocuments(applicationId, tokenHeader);
  }

  /**
   * Removes an uploaded document from the application
   */
  @Delete(['applications/:applicationId/documents/:documentType', '../membership-applications/:applicationId/documents/:documentType'])
  @HttpCode(HttpStatus.OK)
  async deleteDocument(
    @Param('applicationId') applicationId: string,
    @Param('documentType') documentType: string,
    @Headers('x-applicant-token') tokenHeader?: string,
  ) {
    return this.membershipService.deleteDocument(applicationId, documentType, tokenHeader);
  }

  /**
   * Downloads or streams a document for secure viewing
   */
  @Get(['applications/:applicationId/documents/:documentId/file', '../membership-applications/:applicationId/documents/:documentId/file'])
  async getDocumentFile(
    @Param('applicationId') applicationId: string,
    @Param('documentId') documentId: string,
    @Res() res: Response,
    @Headers('x-applicant-token') tokenHeader?: string,
  ) {
    const file = await this.membershipService.getDocumentFile(applicationId, documentId, tokenHeader);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.fileName)}"`);
    res.send(file.buffer);
  }

  /**
   * Submits the application with validation that all 4 documents are uploaded
   */
  @Post(['application', 'applications/submit', '../membership-applications/:applicationId/submit'])
  @HttpCode(HttpStatus.OK)
  async submitApplication(
    @Body() dto: CreateApplicationDto,
    @Headers('x-applicant-token') tokenHeader?: string,
  ) {
    return this.membershipService.submitApplication(dto, dto.applicantToken || tokenHeader);
  }
}

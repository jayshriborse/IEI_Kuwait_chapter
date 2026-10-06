import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminRolesGuard } from './admin-roles.guard';
import { RequireAdminRoles } from './admin-roles.decorator';
import { OfficePosition } from '../generated/prisma/client';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminRolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Executive Dashboard Overview
   */
  @Get('dashboard')
  @RequireAdminRoles(
    'ADMIN',
    OfficePosition.CHAIRMAN,
    OfficePosition.GENERAL_SECRETARY,
    OfficePosition.TREASURER,
    OfficePosition.EC_VOLUNTEER,
  )
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  /**
   * Members List (Admin)
   */
  @Get('members')
  @RequireAdminRoles(
    'ADMIN',
    OfficePosition.CHAIRMAN,
    OfficePosition.GENERAL_SECRETARY,
    OfficePosition.TREASURER,
  )
  async getMembers(
    @Query('search') search?: string,
    @Query('grade') grade?: string,
    @Query('discipline') discipline?: string,
    @Query('status') status?: string,
    @Query('area') area?: string,
  ) {
    return this.adminService.getMembers({ search, grade, discipline, status, area });
  }

  /**
   * Export Members CSV
   */
  @Post('members/export')
  @RequireAdminRoles(
    'ADMIN',
    OfficePosition.CHAIRMAN,
    OfficePosition.GENERAL_SECRETARY,
    OfficePosition.TREASURER,
  )
  @HttpCode(HttpStatus.OK)
  async exportMembersCsv(@Req() req: any, @Res() res: Response) {
    const csvData = await this.adminService.exportMembersCsv(req.user.userId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="iei-members-export.csv"');
    res.send(csvData);
  }

  /**
   * Single Member Detail
   */
  @Get('members/:id')
  @RequireAdminRoles(
    'ADMIN',
    OfficePosition.CHAIRMAN,
    OfficePosition.GENERAL_SECRETARY,
    OfficePosition.TREASURER,
  )
  async getMemberById(@Param('id') id: string) {
    return this.adminService.getMemberById(id);
  }

  /**
   * Applications List
   */
  @Get('applications')
  @RequireAdminRoles(
    'ADMIN',
    OfficePosition.CHAIRMAN,
    OfficePosition.GENERAL_SECRETARY,
  )
  async getApplications(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getApplications({ status, search });
  }

  /**
   * Application Detail
   */
  @Get('applications/:id')
  @RequireAdminRoles(
    'ADMIN',
    OfficePosition.CHAIRMAN,
    OfficePosition.GENERAL_SECRETARY,
  )
  async getApplicationById(@Param('id') id: string) {
    return this.adminService.getApplicationById(id);
  }

  /**
   * General Secretary Stage: Recommend application to Chairman
   */
  @Post('applications/:id/recommend')
  @RequireAdminRoles('ADMIN', OfficePosition.GENERAL_SECRETARY)
  @HttpCode(HttpStatus.OK)
  async recommendApplication(
    @Req() req: any,
    @Param('id') id: string,
    @Body('notes') notes?: string,
  ) {
    return this.adminService.recommendApplication(req.user.userId, id, notes);
  }

  /**
   * Chairman Final Endorsement: Approve application
   */
  @Post('applications/:id/approve')
  @RequireAdminRoles('ADMIN', OfficePosition.CHAIRMAN)
  @HttpCode(HttpStatus.OK)
  async approveApplication(
    @Req() req: any,
    @Param('id') id: string,
    @Body('notes') notes?: string,
  ) {
    return this.adminService.approveApplication(req.user.userId, id, notes);
  }

  /**
   * Reject Application with Reason
   */
  @Post('applications/:id/reject')
  @RequireAdminRoles(
    'ADMIN',
    OfficePosition.CHAIRMAN,
    OfficePosition.GENERAL_SECRETARY,
  )
  @HttpCode(HttpStatus.OK)
  async rejectApplication(
    @Req() req: any,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.adminService.rejectApplication(req.user.userId, id, reason);
  }

  /**
   * Secure Document Download / Stream with Audit Log
   */
  @Get('applications/:id/documents/:docId/file')
  @RequireAdminRoles(
    'ADMIN',
    OfficePosition.CHAIRMAN,
    OfficePosition.GENERAL_SECRETARY,
  )
  async downloadDocument(
    @Req() req: any,
    @Param('id') id: string,
    @Param('docId') docId: string,
    @Res() res: Response,
  ) {
    const file = await this.adminService.getApplicationDocumentFile(
      req.user.userId,
      id,
      docId,
    );
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(file.fileName)}"`,
    );
    res.send(file.buffer);
  }

  /**
   * Audit Logs
   */
  @Get('audit-logs')
  @RequireAdminRoles(
    'ADMIN',
    OfficePosition.CHAIRMAN,
    OfficePosition.GENERAL_SECRETARY,
  )
  async getAuditLogs(
    @Query('action') action?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAuditLogs({
      action,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  /**
   * Admin Users
   */
  @Get('users')
  @RequireAdminRoles('ADMIN', OfficePosition.CHAIRMAN)
  async getAdminUsers() {
    return this.adminService.getAdminUsers();
  }

  /**
   * Assign Role
   */
  @Post('users/assign-role')
  @RequireAdminRoles('ADMIN', OfficePosition.CHAIRMAN)
  @HttpCode(HttpStatus.OK)
  async assignRole(
    @Req() req: any,
    @Body() body: { memberCode: string; position: OfficePosition; term?: string },
  ) {
    return this.adminService.assignAdminRole(
      req.user.userId,
      body.memberCode,
      body.position,
      body.term,
    );
  }

  /**
   * System Settings
   */
  @Get('system-settings')
  @RequireAdminRoles(
    'ADMIN',
    OfficePosition.CHAIRMAN,
    OfficePosition.GENERAL_SECRETARY,
    OfficePosition.TREASURER,
    OfficePosition.EC_VOLUNTEER,
  )
  async getSystemSettings() {
    return this.adminService.getSystemSettings();
  }

  /**
   * Register: Blood Donors
   */
  @Get('registers/blood-donors')
  @RequireAdminRoles(
    'ADMIN',
    OfficePosition.CHAIRMAN,
    OfficePosition.GENERAL_SECRETARY,
    OfficePosition.TREASURER,
    OfficePosition.EC_VOLUNTEER,
  )
  async getBloodDonors(@Query('bloodGroup') bloodGroup?: string) {
    return this.adminService.getBloodDonors(bloodGroup);
  }

  /**
   * Aggregated Reports Summary
   */
  @Get('reports/summary')
  @RequireAdminRoles(
    'ADMIN',
    OfficePosition.CHAIRMAN,
    OfficePosition.GENERAL_SECRETARY,
    OfficePosition.TREASURER,
  )
  async getReportsSummary() {
    return this.adminService.getReportsSummary();
  }
}

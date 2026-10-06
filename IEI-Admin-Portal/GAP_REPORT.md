# IEI Kuwait Chapter Admin Portal — Gap Report & Backend Roadmap

**Date**: October 6, 2026  
**Target Backend**: `IEI-Backend` (NestJS + Prisma + PostgreSQL `localhost:5432/iei_dev`)  
**Portal Client**: `IEI-Admin-Portal` (React 19 + TypeScript + Vite + TailwindCSS + Lucide)

---

## 1. Overview & Strategy
In accordance with Rule 1 ("DATA RULES: Never create fake members, applications, events, RSVPs, receipts, documents, counts or dashboard numbers. If missing, render the page and button, disable the button and show a small 'Backend not available yet' badge"), every button, table, tab, and form specified in the requirements has been implemented in the UI. 

Where backend endpoints already exist, they are wired up directly to live database models (`Member`, `MembershipApplication`, `MemberSubscription`, `Event`, `EventCheckIn`, `AuditLog`, `OfficeBearerAssignment`). 

Where backend endpoints or Prisma models are currently absent in `IEI-Backend`, the corresponding buttons are rendered in their disabled state with a `BackendMissingBadge` ("Backend not available yet"), empty states indicate missing database tables, and the technical specification below details what backend migrations and controller changes are required to activate them.

---

## 2. Comprehensive Gap Inventory

| Feature / UI Button | Route | UI State | Missing Endpoint | Missing Prisma Model / Field | Required Backend Changes to Enable |
|---|---|---|---|---|---|
| **Member Sign-in Unlinking** | `/admin/members/:id` (Overview Tab) | Button disabled + Badge | `DELETE /admin/members/:id/auth-provider` | `Member.googleId`, `Member.appleId` revocation columns | Create `DELETE` endpoint in `AdminController`. Clear OAuth identifier and write action to `AuditLog`. |
| **Member Direct Profile Update** | `/admin/members/:id` (Edit Mode) | Edit Form | `PATCH /admin/members/:id` | None (`Member` model exists) | Wire `updateMember` service method to update personal/professional fields with validation and write to `AuditLog`. |
| **Member Registry Import** | `/admin/members` | Button disabled + Badge | `POST /admin/members/import-csv` | Temporary batch upload staging table | Implement multipart CSV parser with validation for IEI Member Code uniqueness and duplicate handling. |
| **Event Delete Draft** | `/admin/events/new`, `/admin/events/:id/edit` | Button disabled + Badge | `DELETE /events/:id` | Soft delete flag `Event.isDeleted` | Add soft-delete flag to `Event` model and guard `DELETE /events/:id` so only `DRAFT` events without RSVPs can be purged. |
| **Event Duplicate** | `/admin/events` | Table action | `POST /events/:id/duplicate` | None (`Event` model exists) | Duplicate event row with title suffix `" (Copy)"`, clear dates and RSVPs, set status to `DRAFT`. |
| **Participant Reminder Dispatch** | `/admin/events/:id/participants` | Button disabled + Badge | `POST /events/:id/remind-rsvps` | Notification queue / FCM integration | Dispatch reminder push notification to all RSVPs for the specific event ID. |
| **Registers: Speakers** | `/admin/registers/speakers` | Tab empty + Badge | `GET /registers/speakers` | `SpeakerProfile` model | Create Prisma model with fields `memberId`, `topics`, `bio`, `yearsOfExperience`, `consentGranted`. |
| **Registers: Skills & Expertise** | `/admin/registers/skills` | Tab empty + Badge | `GET /registers/skills` | `MemberSkill` model | Create Prisma model with fields `memberId`, `skillName`, `proficiency`, `industryDomain`, `consentGranted`. |
| **Registers: Member Referrals** | `/admin/registers/referrals` | Tab empty + Badge | `GET /registers/referrals` | `MemberReferral` model | Create Prisma model linking referring member with candidate details and tracking status. |
| **Registers: Carpool Community** | `/admin/registers/carpool` | Tab empty + Badge | `GET /registers/carpool` | `CarpoolOffering` model | Create Prisma model with `memberId`, `routeFromArea`, `routeToArea`, `seatsAvailable`, `scheduleTime`. |
| **Registers: Corporate Sponsors** | `/admin/registers/sponsors` | Tab empty + Badge | `GET /registers/sponsors` | `CorporateSponsor` model | Create Prisma model with `companyName`, `contactPerson`, `tier`, `agreementDocKey`, `activeUntil`. |
| **Urgent Blood Request Broadcast** | `/admin/registers/blood-donors` | Modal disabled + Badge | `POST /registers/blood-donors/urgent-request` | `UrgentBloodRequest` model | Create emergency SMS / Push broadcast queue targeting matched blood group members with granted consent. |
| **Job Vacancies Review (All actions)** | `/admin/jobs` | Buttons disabled + Empty State | `GET /jobs`, `POST /jobs/:id/approve`, `POST /jobs/:id/refuse` | `JobVacancy`, `JobApplication` models | Create Prisma models for `JobVacancy` (`title`, `company`, `status: PENDING\|PUBLISHED\|REFUSED`, `salary`, `refusalReason`, `isAgencyFeeCharging: boolean`). |
| **CMS: News Articles Management** | `/admin/content/news` | Buttons disabled + Empty State | `GET /content/news`, `POST /content/news`, `PATCH /content/news/:id` | `NewsArticle` model | Create Prisma model with `title`, `slug`, `contentMarkdown`, `coverImage`, `publishedAt`, `authorMemberId`. |
| **CMS: Announcements Management** | `/admin/content/announcements` | Buttons disabled + Empty State | `GET /content/announcements`, `POST /content/announcements` | `Announcement` model | Create Prisma model with `title`, `body`, `priority`, `validUntil`, `isActive`. |
| **CMS: Photo Gallery Albums & Approval** | `/admin/content/gallery` | Buttons disabled + Empty State | `GET /content/gallery`, `POST /content/gallery/photos/:id/approve` | `GalleryAlbum`, `GalleryPhoto` models | Create Prisma models with member photo uploads awaiting admin review before public exhibition. |
| **CMS: Historical Archives** | `/admin/content/archives` | Buttons disabled + Empty State | `GET /content/archives` | `HistoricalArchive` model | Create Prisma model with year, publication title, annual report PDF storage key, and download tracking. |
| **CMS: Static Pages & Banners** | `/admin/content/pages`, `/admin/content/banners` | Buttons disabled + Empty State | `GET /content/pages`, `GET /content/banners` | `CmsPage`, `HomeBanner` models | Create dynamic page content and hero carousel storage for the chapter website. |
| **Official PDF Report Generator** | `/admin/reports` | Button disabled + Badge | `GET /admin/reports/export-pdf` | None (Backend report aggregation exists) | Install `@nestjs/platform-express` PDF generator (e.g. `puppeteer` or `pdfkit`) to render formatted chapter ledger PDF with seal. |
| **Officer Deactivation Resolution** | `/admin/settings/admin-users` | Button disabled + Badge | `POST /admin/users/:id/deactivate` | `OfficeBearerAssignment.deactivationReason` | Add required reason field and update `OfficeBearerAssignment.active = false` with chapter executive audit entry. |

---

## 3. Recommended Phased Implementation Plan

### Phase 1: High-Impact Operations (Next Sprint)
1. **Member Direct Profile Update (`PATCH /admin/members/:id`)**:
   - Allows Secretaries to correct member details directly without SQL updates.
2. **Event Draft Deletion (`DELETE /events/:id`)**:
   - Soft deletes events that have zero RSVPs.
3. **Official PDF Generation (`GET /admin/reports/export-pdf`)**:
   - Delivers printable executive summaries for AGM presentation.

### Phase 2: Community Registries (Sprint 2)
1. **Job Vacancies Review Engine (`/admin/jobs`)**:
   - Migrates `JobVacancy` schema to protect members from unethical recruitment fees.
2. **Registers Expansion (`Speakers`, `Skills`, `Sponsors`)**:
   - Standardizes community registries under the existing member consent framework.

### Phase 3: Content Management System (Sprint 3)
1. **CMS Models (`NewsArticle`, `Announcement`, `GalleryPhoto`, `HomeBanner`)**:
   - Decouples static website content from hardcoded bundles into database-driven content.

import { SetMetadata } from '@nestjs/common';
import { OfficePosition } from '../generated/prisma/client';

export const ADMIN_ROLES_KEY = 'admin_roles';

export type AllowedAdminRole = OfficePosition | 'ADMIN';

export const RequireAdminRoles = (...roles: AllowedAdminRole[]) =>
  SetMetadata(ADMIN_ROLES_KEY, roles);

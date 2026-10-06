import { SetMetadata } from '@nestjs/common';
import { OfficePosition } from '../../generated/prisma/client';

export const REQUIRE_POSITION_KEY = 'require_position';
export const RequirePosition = (position: OfficePosition) =>
  SetMetadata(REQUIRE_POSITION_KEY, position);

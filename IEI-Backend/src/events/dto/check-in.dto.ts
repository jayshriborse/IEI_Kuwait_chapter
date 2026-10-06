import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckInDto {
  @IsString()
  @IsNotEmpty()
  memberCode: string;

  @IsString()
  @IsOptional()
  eventId?: string;

  @IsString()
  @IsOptional()
  scannedAt?: string;

  @IsBoolean()
  @IsOptional()
  deviceOffline?: boolean;

  @IsBoolean()
  @IsOptional()
  manual?: boolean;

  @IsString()
  @IsOptional()
  volunteerMemberId?: string;
}

export class BatchSyncItemDto {
  @IsString()
  @IsNotEmpty()
  memberCode: string;

  @IsString()
  @IsOptional()
  scannedAt?: string;

  @IsString()
  @IsOptional()
  clientScanId?: string;

  @IsBoolean()
  @IsOptional()
  deviceOffline?: boolean;

  @IsBoolean()
  @IsOptional()
  manual?: boolean;

  @IsString()
  @IsOptional()
  volunteerMemberId?: string;
}

export class BatchSyncDto {
  @IsString()
  @IsOptional()
  eventId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchSyncItemDto)
  scans: BatchSyncItemDto[];
}

import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  memberCode?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  designation?: string;

  @IsString()
  @IsOptional()
  governorate?: string;

  @IsString()
  @IsOptional()
  sector?: string;

  @IsString()
  @IsOptional()
  areaLocality?: string;

  @IsString()
  @IsOptional()
  familyStatus?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  familyMembersCount?: number;
}

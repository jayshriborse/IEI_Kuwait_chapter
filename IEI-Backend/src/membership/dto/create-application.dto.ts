import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  applicantName?: string;

  @IsString()
  @IsOptional()
  mobile?: string;

  @IsString()
  @IsOptional()
  applicantMobile?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  applicantEmail?: string;

  @IsString()
  @IsNotEmpty()
  discipline: string;

  @IsString()
  @IsNotEmpty()
  employer: string;

  @IsString()
  @IsNotEmpty()
  designation: string;

  @IsOptional()
  experienceYears?: any = '5+ years';

  @IsString()
  @IsNotEmpty()
  qualification: string;

  @IsString()
  @IsOptional()
  referredBy?: string;

  @IsString()
  @IsOptional()
  degreeCertRef?: string;

  @IsString()
  @IsOptional()
  passportRef?: string;

  @IsString()
  @IsOptional()
  civilIdRef?: string;

  @IsString()
  @IsOptional()
  photoRef?: string;

  @IsString()
  @IsOptional()
  applicationId?: string;

  @IsString()
  @IsOptional()
  applicantToken?: string;
}

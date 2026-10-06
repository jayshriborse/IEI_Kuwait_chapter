import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export const VALID_DOCUMENT_TYPES = [
  'DEGREE_CERTIFICATE',
  'PASSPORT_COPY',
  'CIVIL_ID',
  'PHOTOGRAPH',
] as const;

export type ValidDocumentType = typeof VALID_DOCUMENT_TYPES[number];

export class UploadDocumentDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(VALID_DOCUMENT_TYPES, {
    message: 'documentType must be one of: DEGREE_CERTIFICATE, PASSPORT_COPY, CIVIL_ID, PHOTOGRAPH',
  })
  documentType: ValidDocumentType;

  @IsString()
  @IsOptional()
  applicantToken?: string;
}

import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class LinkMemberDto {
  @IsString()
  @IsNotEmpty()
  memberCode: string;

  @IsString()
  @IsNotEmpty()
  mobile: string;

  @IsString()
  @IsOptional()
  authIdentityId?: string;
}

import { IsString, IsOptional } from 'class-validator';

export class AssignConvenorDto {
  @IsOptional()
  @IsString()
  memberId?: string;

  @IsOptional()
  @IsString()
  memberCode?: string;
}

import { IsString, IsNotEmpty } from 'class-validator';

export class DevLoginDto {
  @IsString()
  @IsNotEmpty()
  memberCode: string;

  @IsString()
  @IsNotEmpty()
  mobile: string;
}

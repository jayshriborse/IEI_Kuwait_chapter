import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty()
  idToken: string;

  @IsString()
  @IsOptional()
  accessToken?: string;
}

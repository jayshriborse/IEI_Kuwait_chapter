import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class RsvpDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  seats?: number = 1;

  @IsOptional()
  familyCount?: any = '+1';

  @IsOptional()
  @IsString()
  guestName?: string;

  @IsOptional()
  @IsString()
  guestMobile?: string;

  @IsOptional()
  @IsString()
  guestEmail?: string;
}

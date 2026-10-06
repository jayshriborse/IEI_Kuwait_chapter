import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateWingPostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsDateString()
  eventDate?: string;

  @IsOptional()
  @IsString()
  imageKey?: string;
}

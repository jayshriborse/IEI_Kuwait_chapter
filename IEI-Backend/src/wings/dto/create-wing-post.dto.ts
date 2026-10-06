import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateWingPostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsOptional()
  @IsDateString()
  eventDate?: string;

  @IsOptional()
  @IsString()
  imageKey?: string;
}

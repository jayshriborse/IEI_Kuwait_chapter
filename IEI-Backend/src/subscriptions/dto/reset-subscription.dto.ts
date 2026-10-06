import { IsNotEmpty, IsString } from 'class-validator';

export class ResetSubscriptionDto {
  @IsNotEmpty()
  @IsString()
  memberCode: string;
}

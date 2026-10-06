import { IsEnum, IsNotEmpty } from 'class-validator';
import { PaymentMethod } from '../../generated/prisma/client';

export class CreateDeclarationDto {
  @IsNotEmpty()
  @IsEnum(PaymentMethod, {
    message: 'method must be either BANK_TRANSFER or CASH',
  })
  method: PaymentMethod;
}

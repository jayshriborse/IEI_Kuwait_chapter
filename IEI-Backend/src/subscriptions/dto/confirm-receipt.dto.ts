import { IsNotEmpty, IsString, Matches, Length } from 'class-validator';

export class ConfirmReceiptDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 20, { message: 'receiptNo must be between 1 and 20 characters' })
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'receiptNo must contain only alphanumeric characters (letters and digits)',
  })
  receiptNo: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 20, { message: 'bookNo must be between 1 and 20 characters' })
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'bookNo must contain only alphanumeric characters (letters and digits)',
  })
  bookNo: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

const NAME_PATTERN = /^[\u0600-\u06FFa-zA-Z\s'-]+$/;

export class SetInvoiceRecipientDto {
  @ApiProperty({ description: 'نام صادرکننده فاکتور' })
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  @Matches(NAME_PATTERN, { message: 'firstName contains invalid characters' })
  firstName!: string;

  @ApiProperty({ description: 'نام خانوادگی صادرکننده فاکتور' })
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  @Matches(NAME_PATTERN, { message: 'lastName contains invalid characters' })
  lastName!: string;
}

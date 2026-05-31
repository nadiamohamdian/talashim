import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  recipient!: string;

  @ApiProperty()
  @IsString()
  @Matches(/^09\d{9}$/)
  phone!: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  line1!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  city!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  state!: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  postalCode!: string;
}

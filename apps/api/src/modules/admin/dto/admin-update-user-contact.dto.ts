import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class AdminUpdateUserAddressDto {
  @ApiPropertyOptional({ description: 'Existing address id; omit to update/create primary' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  recipient?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^09\d{9}$/)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(5)
  line1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(5)
  postalCode?: string;
}

export class AdminUpdateUserContactDto {
  @ApiPropertyOptional({ description: 'KYC / contact mobile (09xxxxxxxxx)' })
  @IsOptional()
  @IsString()
  @Matches(/^09\d{9}$/)
  phone?: string;

  @ApiPropertyOptional({ description: 'Required when creating KYC for a user without one' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  nationalId?: string;

  @ApiPropertyOptional({ type: AdminUpdateUserAddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdminUpdateUserAddressDto)
  address?: AdminUpdateUserAddressDto;
}

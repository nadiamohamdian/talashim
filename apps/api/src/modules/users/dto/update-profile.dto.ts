import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string;

  @ApiPropertyOptional({ description: 'Iranian national ID (10 digits)' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{10}$/, { message: 'nationalId must be 10 digits' })
  nationalId?: string;

  @ApiPropertyOptional({ description: 'Iranian mobile (09xxxxxxxxx)' })
  @IsOptional()
  @IsString()
  @Matches(/^09\d{9}$/, { message: 'phone must be a valid Iranian mobile' })
  phone?: string;
}

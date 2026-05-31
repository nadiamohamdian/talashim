import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class SubmitKycDto {
  @ApiProperty({ example: '0012345678' })
  @IsString()
  @Matches(/^\d{10}$/, { message: 'nationalId must be 10 digits' })
  nationalId!: string;

  @ApiProperty({ example: '09121234567' })
  @IsString()
  @Matches(/^09\d{9}$/, { message: 'phone must be a valid Iranian mobile' })
  phone!: string;

  @ApiPropertyOptional({ default: 'national_card' })
  @IsOptional()
  @IsString()
  documentType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(5)
  documentUrl?: string;
}

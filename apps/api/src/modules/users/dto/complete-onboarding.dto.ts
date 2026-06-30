import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class CompleteOnboardingDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @ValidateIf((payload: CompleteOnboardingDto) => Boolean(payload.email?.trim()))
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ minLength: 8, description: 'Optional when only updating email' })
  @ValidateIf((payload: CompleteOnboardingDto) => Boolean(payload.newPassword?.trim()))
  @IsOptional()
  @IsString()
  @MinLength(8)
  newPassword?: string;
}

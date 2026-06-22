import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: '09121234567',
    description: 'Iranian mobile number or email address',
  })
  @IsString()
  @MinLength(3)
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$|^09\d{9}$/, {
    message: 'identifier must be a valid email or Iranian mobile number',
  })
  identifier!: string;

  @ApiProperty({ example: 'Admin12345!', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}

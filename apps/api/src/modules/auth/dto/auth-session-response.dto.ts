import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@/generated/prisma';

export class AuthUserDto {
  @ApiProperty({ example: 'cluser123456789' })
  id!: string;

  @ApiProperty({ example: 'user@sadafgold.local' })
  email!: string;

  @ApiProperty({ example: 'علی محمدیان' })
  fullName!: string;

  @ApiProperty({ enum: Role, example: Role.CUSTOMER })
  role!: Role;
}

export class AuthTokensDto {
  @ApiProperty({
    description: 'JWT access token (Authorization: Bearer)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Refresh token (httpOnly cookie or request body)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken!: string;
}

export class AuthSessionResponseDto {
  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;

  @ApiProperty({ type: AuthTokensDto })
  tokens!: AuthTokensDto;
}

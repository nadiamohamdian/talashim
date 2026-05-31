import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  role!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional()
  kycStatus?: string;
}

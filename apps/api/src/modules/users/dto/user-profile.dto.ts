import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  fullName!: string;

  @ApiPropertyOptional({ nullable: true })
  firstName?: string | null;

  @ApiPropertyOptional({ nullable: true })
  lastName?: string | null;

  @ApiPropertyOptional({ nullable: true })
  nationalId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  phone?: string | null;

  @ApiProperty()
  requiresPasswordSetup!: boolean;

  @ApiProperty()
  role!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional()
  kycStatus?: string;
}

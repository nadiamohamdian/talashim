import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

export class PatchPlatformSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  general?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  commerce?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  gold?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  featureFlags?: Record<string, unknown>;
}

export class PlatformSettingsResponseDto {
  @ApiProperty()
  general!: Record<string, unknown>;

  @ApiProperty()
  commerce!: Record<string, unknown>;

  @ApiProperty()
  gold!: Record<string, unknown>;

  @ApiProperty()
  featureFlags!: Record<string, unknown>;

  @ApiProperty()
  updatedAt!: string;
}

export class SiteStatusResponseDto {
  @ApiProperty()
  maintenanceMode!: boolean;

  @ApiProperty({ nullable: true })
  maintenanceMessage!: string | null;

  @ApiProperty({ nullable: true })
  updatedAt!: string | null;
}

export class SiteConfigResponseDto extends SiteStatusResponseDto {
  @ApiProperty()
  general!: Record<string, unknown>;

  @ApiProperty()
  commerce!: Record<string, unknown>;

  @ApiProperty()
  gold!: Record<string, unknown>;

  @ApiProperty()
  featureFlags!: Record<string, unknown>;
}

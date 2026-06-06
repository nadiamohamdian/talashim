import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsString, ValidateNested } from 'class-validator';

export class UpdateRolePermissionsDto {
  @ApiProperty({ example: 'editor' })
  @IsString()
  roleSlug!: string;

  @ApiProperty({ type: [String], example: ['admin.dashboard.view', 'admin.products.read'] })
  @IsArray()
  @IsString({ each: true })
  permissions!: string[];
}

export class UpdateRolePermissionsBatchDto {
  @ApiProperty({ type: [UpdateRolePermissionsDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateRolePermissionsDto)
  updates!: UpdateRolePermissionsDto[];
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './admin-query.dto';

export class AdminSessionsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by user email or name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['active', 'revoked', 'expired', 'all'] })
  @IsOptional()
  @IsIn(['active', 'revoked', 'expired', 'all'])
  status?: 'active' | 'revoked' | 'expired' | 'all';
}

export class AdminLoginHistoryQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter auth.* action prefix' })
  @IsOptional()
  @IsString()
  action?: string;
}

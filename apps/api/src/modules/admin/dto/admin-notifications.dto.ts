import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  NotificationChannel,
  NotificationPriority,
  NotificationDeliveryStatus,
  NotificationRuleTrigger,
  Role,
} from '@/generated/prisma';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { PaginationQueryDto } from './admin-query.dto';

export class AdminNotificationsInboxQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  unreadOnly?: boolean;

  @ApiPropertyOptional({ enum: NotificationChannel })
  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;
}

export class CreateStaffNotificationDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  body!: string;

  @ApiPropertyOptional({ enum: NotificationChannel })
  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @ApiPropertyOptional({ enum: NotificationPriority })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  targetRole?: Role;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recipientUserId?: string;
}

export class AdminTemplatesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: NotificationChannel })
  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;
}

export class UpsertNotificationTemplateDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  key!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  channel!: NotificationChannel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  body!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}

export class AdminRulesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: NotificationRuleTrigger })
  @IsOptional()
  @IsEnum(NotificationRuleTrigger)
  trigger?: NotificationRuleTrigger;
}

export class UpsertNotificationRuleDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ enum: NotificationRuleTrigger })
  @IsEnum(NotificationRuleTrigger)
  trigger!: NotificationRuleTrigger;

  @ApiProperty()
  @IsString()
  templateId!: string;

  @ApiProperty({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  channel!: NotificationChannel;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isEnabled?: boolean;
}

export class AdminDeliveryQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: NotificationDeliveryStatus })
  @IsOptional()
  @IsEnum(NotificationDeliveryStatus)
  status?: NotificationDeliveryStatus;

  @ApiPropertyOptional({ enum: NotificationChannel })
  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

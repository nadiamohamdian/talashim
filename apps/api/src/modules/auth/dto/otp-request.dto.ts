import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class OtpRequestDto {
  @ApiProperty({ example: 'you@example.com or 09121234567' })
  @IsString()
  @MinLength(3)
  identifier!: string;
}

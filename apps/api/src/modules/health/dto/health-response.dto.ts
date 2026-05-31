import { ApiProperty } from '@nestjs/swagger';

export class HealthChecksDto {
  @ApiProperty({ example: 'up', enum: ['up', 'down'] })
  database!: string;

  @ApiProperty({ example: 'up', enum: ['up', 'down'] })
  redis!: string;

  @ApiProperty({ example: 'ok', enum: ['ok', 'degraded', 'down'] })
  marketCache!: string;
}

export class HealthResponseDto {
  @ApiProperty({ example: 'ok', enum: ['ok', 'degraded', 'error'] })
  status!: string;

  @ApiProperty({ type: HealthChecksDto })
  checks!: HealthChecksDto;

  @ApiProperty({ example: '2026-05-30T12:00:00.000Z' })
  timestamp!: string;
}

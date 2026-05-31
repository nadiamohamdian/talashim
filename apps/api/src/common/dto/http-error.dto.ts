import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiErrorPayloadDto {
  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    example: 'Validation failed',
  })
  message!: string | string[];

  @ApiPropertyOptional({ example: 'Bad Request' })
  error?: string;
}

export class ApiErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({ example: '/api/v1/wallet/deposit/rial' })
  path!: string;

  @ApiProperty({ example: '2026-05-30T12:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({ type: ApiErrorPayloadDto })
  error!: ApiErrorPayloadDto;
}

export const API_ERROR_EXAMPLES = {
  badRequest: {
    statusCode: 400,
    path: '/api/v1/trading/market/buy',
    timestamp: '2026-05-30T12:00:00.000Z',
    error: {
      message: ['quantityGram must be a positive number'],
      error: 'Bad Request',
    },
  },
  unauthorized: {
    statusCode: 401,
    path: '/api/v1/admin/users',
    timestamp: '2026-05-30T12:00:00.000Z',
    error: {
      message: 'Authentication required',
      error: 'Unauthorized',
    },
  },
  forbidden: {
    statusCode: 403,
    path: '/api/v1/admin/analytics',
    timestamp: '2026-05-30T12:00:00.000Z',
    error: {
      message: 'Admin access required',
      error: 'Forbidden',
    },
  },
  notFound: {
    statusCode: 404,
    path: '/api/v1/trading/orders/clxyz',
    timestamp: '2026-05-30T12:00:00.000Z',
    error: {
      message: 'Trade order not found',
      error: 'Not Found',
    },
  },
  conflict: {
    statusCode: 409,
    path: '/api/v1/wallet/transfer',
    timestamp: '2026-05-30T12:00:00.000Z',
    error: {
      message: 'Duplicate journal reference',
      error: 'Conflict',
    },
  },
  tooManyRequests: {
    statusCode: 429,
    path: '/api/v1/auth/login',
    timestamp: '2026-05-30T12:00:00.000Z',
    error: {
      message: 'ThrottlerException: Too Many Requests',
      error: 'Too Many Requests',
    },
  },
  internal: {
    statusCode: 500,
    path: '/api/v1/pricing/live',
    timestamp: '2026-05-30T12:00:00.000Z',
    error: {
      message: 'Internal server error',
    },
  },
} as const;

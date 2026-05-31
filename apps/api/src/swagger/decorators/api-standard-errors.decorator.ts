import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { API_ERROR_EXAMPLES, ApiErrorResponseDto } from '@/common/dto/http-error.dto';

interface ApiStandardErrorsOptions {
  includeUnauthorized?: boolean;
  includeForbidden?: boolean;
  includeNotFound?: boolean;
  includeConflict?: boolean;
}

export function ApiStandardErrors(options: ApiStandardErrorsOptions = {}) {
  const {
    includeUnauthorized = true,
    includeForbidden = true,
    includeNotFound = true,
    includeConflict = false,
  } = options;

  const responses = [
    ApiResponse({
      status: 400,
      description: 'Validation error or bad request',
      type: ApiErrorResponseDto,
      schema: { example: API_ERROR_EXAMPLES.badRequest },
    }),
    ApiResponse({
      status: 429,
      description: 'Rate limit exceeded',
      type: ApiErrorResponseDto,
      schema: { example: API_ERROR_EXAMPLES.tooManyRequests },
    }),
    ApiResponse({
      status: 500,
      description: 'Unexpected server error',
      type: ApiErrorResponseDto,
      schema: { example: API_ERROR_EXAMPLES.internal },
    }),
  ];

  if (includeUnauthorized) {
    responses.push(
      ApiResponse({
        status: 401,
        description: 'Missing or invalid JWT access token',
        type: ApiErrorResponseDto,
        schema: { example: API_ERROR_EXAMPLES.unauthorized },
      }),
    );
  }

  if (includeForbidden) {
    responses.push(
      ApiResponse({
        status: 403,
        description: 'Insufficient permissions (RBAC)',
        type: ApiErrorResponseDto,
        schema: { example: API_ERROR_EXAMPLES.forbidden },
      }),
    );
  }

  if (includeNotFound) {
    responses.push(
      ApiResponse({
        status: 404,
        description: 'Resource not found',
        type: ApiErrorResponseDto,
        schema: { example: API_ERROR_EXAMPLES.notFound },
      }),
    );
  }

  if (includeConflict) {
    responses.push(
      ApiResponse({
        status: 409,
        description: 'Conflict (e.g. duplicate idempotency key)',
        type: ApiErrorResponseDto,
        schema: { example: API_ERROR_EXAMPLES.conflict },
      }),
    );
  }

  return applyDecorators(...responses);
}

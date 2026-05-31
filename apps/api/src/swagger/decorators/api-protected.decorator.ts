import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SWAGGER_JWT_SCHEME } from '../swagger.constants';
import { ApiStandardErrors } from './api-standard-errors.decorator';

interface ApiProtectedOptions {
  includeConflict?: boolean;
}

export function ApiProtected(options: ApiProtectedOptions = {}) {
  return applyDecorators(
    ApiBearerAuth(SWAGGER_JWT_SCHEME),
    ApiStandardErrors({
      includeUnauthorized: true,
      includeForbidden: true,
      includeConflict: options.includeConflict ?? false,
    }),
  );
}

export function ApiPublicErrors() {
  return applyDecorators(
    ApiStandardErrors({
      includeUnauthorized: false,
      includeForbidden: false,
      includeNotFound: true,
    }),
  );
}

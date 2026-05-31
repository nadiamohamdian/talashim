import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import type { Response } from 'express';
import { getApiEnv } from '@/config/env';
import {
  getRequestId,
  type RequestWithContext,
} from '@/common/types/request-context';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<RequestWithContext>();
    const env = getApiEnv();
    const requestId = getRequestId(request);

    const status = this.resolveStatus(exception);
    const payload = this.resolvePayload(exception, env.NODE_ENV === 'production');

    if (status >= 500) {
      this.logger.error(
        JSON.stringify({
          requestId,
          status,
          path: request.url,
          method: request.method,
          error: exception instanceof Error ? exception.message : 'unknown',
          stack: exception instanceof Error ? exception.stack : undefined,
        }),
      );
    } else if (status >= 400) {
      this.logger.warn(
        JSON.stringify({
          requestId,
          status,
          path: request.url,
          method: request.method,
          error: payload,
        }),
      );
    }

    if (exception instanceof ThrottlerException) {
      response.setHeader('Retry-After', '60');
    }

    response.status(status).json({
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      requestId,
      error: payload,
    });
  }

  private resolveStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private resolvePayload(
    exception: unknown,
    isProduction: boolean,
  ): string | Record<string, unknown> {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') {
        return { message: response };
      }
      if (isProduction && exception.getStatus() >= 500) {
        return { message: 'Internal server error' };
      }
      return response as Record<string, unknown>;
    }

    if (isProduction) {
      return { message: 'Internal server error' };
    }

    return {
      message:
        exception instanceof Error ? exception.message : 'Internal server error',
    };
  }
}

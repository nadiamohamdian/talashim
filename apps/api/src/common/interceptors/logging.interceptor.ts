import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { SKIP_LOGGING_KEY } from '@/common/decorators/skip-logging.decorator';
import {
  getRequestId,
  getRoutePath,
  type RequestWithContext,
} from '@/common/types/request-context';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_LOGGING_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skip) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<RequestWithContext>();
    const { method } = request;
    const path = getRoutePath(request);
    const requestId = getRequestId(request);
    const started = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - started;
          this.logger.log(
            JSON.stringify({
              level: 'info',
              requestId,
              method,
              path,
              durationMs,
              statusCode: context.switchToHttp().getResponse<{ statusCode: number }>()
                .statusCode,
            }),
          );
        },
        error: (error: Error) => {
          const durationMs = Date.now() - started;
          this.logger.warn(
            JSON.stringify({
              level: 'warn',
              requestId,
              method,
              path,
              durationMs,
              error: error.message,
            }),
          );
        },
      }),
    );
  }
}

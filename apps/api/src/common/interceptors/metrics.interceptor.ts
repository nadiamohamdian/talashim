import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { MetricsService } from '@/infrastructure/monitoring/metrics.service';
import {
  getRoutePath,
  type RequestWithContext,
} from '@/common/types/request-context';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithContext>();
    const response = context.switchToHttp().getResponse<{ statusCode: number }>();
    const started = Date.now();

    return next.handle().pipe(
      tap(() => this.record(request, response.statusCode || 200, started)),
      catchError((error: { status?: number; getStatus?: () => number }) => {
        const status =
          typeof error?.getStatus === 'function'
            ? error.getStatus()
            : error?.status ?? 500;
        this.record(request, status, started);
        return throwError(() => error);
      }),
    );
  }

  private record(request: RequestWithContext, statusCode: number, started: number) {
    this.metricsService.recordRequest({
      method: request.method,
      route: getRoutePath(request),
      statusCode,
      durationMs: Date.now() - started,
    });
  }
}

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse<{
      setHeader(name: string, value: string): void;
    }>();
    const started = Date.now();

    return next.handle().pipe(
      tap(() => {
        response.setHeader('X-Response-Time', `${Date.now() - started}ms`);
      }),
    );
  }
}

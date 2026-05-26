import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Observable } from 'rxjs';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context
      .switchToHttp()
      .getResponse<{ setHeader(name: string, value: string): void }>();
    response.setHeader('x-request-id', randomUUID());

    return next.handle();
  }
}

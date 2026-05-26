import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      user?: unknown;
      headers: Record<string, string | undefined>;
    }>();

    if (request.user || request.headers.authorization) {
      return true;
    }

    throw new UnauthorizedException('Authentication required');
  }
}

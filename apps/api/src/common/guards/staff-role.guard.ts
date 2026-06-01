import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { isStaffRoleEnum } from '@sadafgold/shared/admin-rbac';

@Injectable()
export class StaffRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: { role?: string } }>();

    if (!isStaffRoleEnum(request.user?.role)) {
      throw new ForbiddenException('Staff access required');
    }

    return true;
  }
}

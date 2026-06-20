import { fetchMyPermissions } from '@/features/admin/api/admin-api';
import type { AdminPermissionKey } from '@/shared/config/admin-permissions';
import { resolvePermissionsForRole } from './permission-resolver';
import { useAdminAuthStore } from '../model/admin-auth-store';

export async function syncAdminPermissionsFromApi(): Promise<boolean> {
  try {
    const { permissions } = await fetchMyPermissions();
    useAdminAuthStore.getState().setPermissions(permissions as AdminPermissionKey[]);
    return true;
  } catch {
    const role = useAdminAuthStore.getState().user?.role;
    if (role) {
      useAdminAuthStore.getState().setPermissions(resolvePermissionsForRole(role));
      return true;
    }
    return false;
  }
}

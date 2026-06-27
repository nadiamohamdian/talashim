import type { StaffRoleSlug } from './roles';
export type UserRoleSlug = StaffRoleSlug | 'customer';
export interface UserProfile {
    id: string;
    email: string;
    fullName: string;
    role: UserRoleSlug;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export interface AuthSession {
    user: UserProfile;
    tokens: AuthTokens;
}
//# sourceMappingURL=auth.d.ts.map
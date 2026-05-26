export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'customer' | 'admin';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession {
  user: UserProfile;
  tokens: AuthTokens;
}

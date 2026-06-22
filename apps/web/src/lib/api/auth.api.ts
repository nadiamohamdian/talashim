import type { AuthSession } from '@sadafgold/types';
import {
  apiPost,
  mapSession,
  type ApiAuthSession,
} from '@/lib/api/client';

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface OtpRequestPayload {
  identifier: string;
}

export interface OtpVerifyPayload {
  identifier: string;
  code: string;
}

export interface OtpRequestResponse {
  success: boolean;
  expiresInSeconds: number;
}

export const authApi = {
  login(payload: LoginPayload): Promise<AuthSession> {
    return apiPost<ApiAuthSession>('/auth/login', payload).then(mapSession);
  },

  requestOtp(payload: OtpRequestPayload): Promise<OtpRequestResponse> {
    return apiPost<OtpRequestResponse>('/auth/otp/request', payload);
  },

  verifyOtp(payload: OtpVerifyPayload): Promise<AuthSession> {
    return apiPost<ApiAuthSession>('/auth/otp/verify', payload).then(mapSession);
  },

  logout(): Promise<{ success: boolean }> {
    return apiPost<{ success: boolean }>('/auth/logout', {});
  },
};

export const { login, requestOtp, verifyOtp, logout } = authApi;

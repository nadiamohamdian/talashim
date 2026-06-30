import type {
  Address,
  CreateAddressPayload,
  KycVerification,
  ProductSummary,
  SubmitKycPayload,
  UpdateAddressPayload,
} from '@sadafgold/types';
import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api/client';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  nationalId?: string | null;
  phone?: string | null;
  requiresPasswordSetup?: boolean;
  requiresEmailSetup?: boolean;
  role: string;
  createdAt: string;
  kycStatus?: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  nationalId?: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  currentPassword?: string;
  newPassword: string;
}

export interface CompleteOnboardingPayload {
  email?: string;
  newPassword?: string;
}

export type KycStatusResponse = KycVerification | { status: 'none' };

export const userApi = {
  getProfile(signal?: AbortSignal): Promise<UserProfile> {
    return apiGet<UserProfile>('/users/me', { signal, abortKey: 'user:profile' });
  },

  updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    return apiPatch<UserProfile>('/users/me', payload);
  },

  changePassword(payload: ChangePasswordPayload): Promise<{ success: boolean }> {
    return apiPost<{ success: boolean }>('/users/me/password', payload);
  },

  completeOnboarding(payload: CompleteOnboardingPayload): Promise<{ success: boolean }> {
    return apiPost<{ success: boolean }>('/users/me/onboarding', payload);
  },

  getKycStatus(signal?: AbortSignal): Promise<KycStatusResponse> {
    return apiGet<KycStatusResponse>('/kyc/me', { signal, abortKey: 'user:kyc' });
  },

  submitKyc(payload: SubmitKycPayload): Promise<KycVerification> {
    return apiPost<KycVerification>('/kyc/submit', payload);
  },

  listAddresses(signal?: AbortSignal): Promise<Address[]> {
    return apiGet<Address[]>('/addresses', { signal, abortKey: 'user:addresses' });
  },

  createAddress(payload: CreateAddressPayload): Promise<Address> {
    return apiPost<Address>('/addresses', payload);
  },

  updateAddress(id: string, payload: UpdateAddressPayload): Promise<Address> {
    return apiPatch<Address>(`/addresses/${id}`, payload);
  },

  deleteAddress(id: string): Promise<{ success: boolean }> {
    return apiDelete<{ success: boolean }>(`/addresses/${id}`);
  },

  listWishlist(signal?: AbortSignal) {
    return apiGet<Array<{
      id: string;
      productId: string;
      createdAt: string;
      product: ProductSummary;
    }>>('/wishlist', { signal, abortKey: 'user:wishlist' });
  },

  addToWishlist(productId: string) {
    return apiPost<{ added: boolean; productId: string }>('/wishlist', { productId });
  },

  removeFromWishlist(productId: string) {
    return apiDelete<{ removed: boolean; productId: string }>(`/wishlist/${productId}`);
  },

  submitContact(payload: {
    fullName: string;
    email?: string;
    phone: string;
    subject?: string;
    message: string;
  }) {
    return apiPost<{ success: boolean }>('/contact', payload);
  },
};

export const {
  getProfile,
  updateProfile,
  changePassword,
  completeOnboarding,
  getKycStatus,
  submitKyc,
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  listWishlist,
  addToWishlist,
  removeFromWishlist,
  submitContact,
} = userApi;

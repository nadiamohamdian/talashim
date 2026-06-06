export type KycStatus = 'pending' | 'approved' | 'rejected';
export interface KycVerification {
    id: string;
    nationalId: string;
    phone: string;
    documentType: string;
    documentUrl: string | null;
    status: KycStatus;
    reviewNote: string | null;
    submittedAt: string;
    reviewedAt: string | null;
}
export interface SubmitKycPayload {
    nationalId: string;
    phone: string;
    documentType?: string;
    documentUrl?: string;
}

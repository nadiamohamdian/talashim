export interface Address {
    id: string;
    title: string;
    recipient: string;
    phone: string;
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    createdAt: string;
}
export interface CreateAddressPayload {
    title: string;
    recipient: string;
    phone: string;
    line1: string;
    city: string;
    state: string;
    postalCode: string;
}
export type UpdateAddressPayload = Partial<CreateAddressPayload>;
//# sourceMappingURL=address.d.ts.map
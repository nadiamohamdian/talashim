'use client';

import type { CheckoutPaymentProvider } from '@sadafgold/types';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CheckoutShippingForm {
  recipient: string;
  phone: string;
  line1: string;
  state: string;
  city: string;
  postalCode: string;
}

interface CheckoutSessionState {
  form: CheckoutShippingForm;
  deliverySlotId: string;
  deliverySlotLabel: string;
  deliveryFeeToman: number;
  isInsured: boolean;
  couponCode: string;
  discountToman: number;
  couponMessage: string | null;
  couponAccepted: boolean;
  discountPercent: number | null;
  couponValidationState: 'idle' | 'loading' | 'success' | 'error';
  paymentProvider: CheckoutPaymentProvider;
  orderId: string | null;
  orderNumber: string | null;
  setForm: (form: Partial<CheckoutShippingForm>) => void;
  setPaymentProvider: (provider: CheckoutPaymentProvider) => void;
  setDeliverySlot: (payload: {
    id: string;
    label: string;
    feeToman: number;
  }) => void;
  setIsInsured: (value: boolean) => void;
  setCouponCode: (code: string) => void;
  setCouponResult: (payload: {
    couponCode: string;
    discountToman: number;
    discountPercent: number | null;
    couponMessage: string | null;
    couponAccepted: boolean;
    state: 'idle' | 'loading' | 'success' | 'error';
  }) => void;
  clearCoupon: () => void;
  setOrder: (payload: { orderId: string; orderNumber: string }) => void;
  reset: () => void;
}

const defaultForm: CheckoutShippingForm = {
  recipient: '',
  phone: '',
  line1: '',
  state: '',
  city: '',
  postalCode: '',
};

export const useCheckoutSessionStore = create<CheckoutSessionState>()(
  persist(
    (set) => ({
      form: defaultForm,
      deliverySlotId: '',
      deliverySlotLabel: '',
      deliveryFeeToman: 0,
      isInsured: false,
      couponCode: '',
      discountToman: 0,
      couponMessage: null,
      couponAccepted: false,
      discountPercent: null,
      couponValidationState: 'idle',
      paymentProvider: 'card_to_card',
      orderId: null,
      orderNumber: null,
      setPaymentProvider: (provider) => set({ paymentProvider: provider }),
      setForm: (form) =>
        set((state) => ({
          form: { ...state.form, ...form },
        })),
      setDeliverySlot: ({ id, label, feeToman }) =>
        set({
          deliverySlotId: id,
          deliverySlotLabel: label,
          deliveryFeeToman: feeToman,
        }),
      setIsInsured: (value) => set({ isInsured: value }),
      setCouponCode: (code) => set({ couponCode: code }),
      setCouponResult: (payload) =>
        set({
          couponCode: payload.couponCode,
          discountToman: payload.discountToman,
          discountPercent: payload.discountPercent,
          couponMessage: payload.couponMessage,
          couponAccepted: payload.couponAccepted,
          couponValidationState: payload.state,
        }),
      clearCoupon: () =>
        set({
          couponCode: '',
          discountToman: 0,
          discountPercent: null,
          couponAccepted: false,
          couponMessage: null,
          couponValidationState: 'idle',
        }),
      setOrder: ({ orderId, orderNumber }) => set({ orderId, orderNumber }),
      reset: () =>
        set({
          form: defaultForm,
          deliverySlotId: '',
          deliverySlotLabel: '',
          deliveryFeeToman: 0,
          isInsured: false,
          couponCode: '',
          discountToman: 0,
          couponMessage: null,
          couponAccepted: false,
          discountPercent: null,
          couponValidationState: 'idle',
          paymentProvider: 'card_to_card',
          orderId: null,
          orderNumber: null,
        }),
    }),
    {
      name: 'checkout-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        form: state.form,
        deliverySlotId: state.deliverySlotId,
        deliverySlotLabel: state.deliverySlotLabel,
        deliveryFeeToman: state.deliveryFeeToman,
        isInsured: state.isInsured,
        couponCode: state.couponCode,
        discountToman: state.discountToman,
        couponMessage: state.couponMessage,
        couponAccepted: state.couponAccepted,
        discountPercent: state.discountPercent,
        couponValidationState: state.couponValidationState,
        paymentProvider: state.paymentProvider,
        orderId: state.orderId,
        orderNumber: state.orderNumber,
      }),
    },
  ),
);

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
  setDiscountToman: (amount: number) => void;
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
      setDiscountToman: (amount) => set({ discountToman: amount }),
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
        paymentProvider: state.paymentProvider,
        orderId: state.orderId,
        orderNumber: state.orderNumber,
      }),
    },
  ),
);

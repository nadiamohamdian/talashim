'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartLineItem {
  id: string;
  slug: string;
  title: string;
  quantity: number;
  priceToman: number;
  imageUrl?: string;
  weightGram?: number;
}

interface CartState {
  items: CartLineItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartLineItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  itemCount: () => number;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((line) => line.id === item.id);
          if (existing) {
            return {
              items: state.items.map((line) =>
                line.id === item.id
                  ? { ...line, quantity: line.quantity + (item.quantity ?? 1) }
                  : line,
              ),
              isOpen: true,
            };
          }
          return {
            items: [
              ...state.items,
              {
                id: item.id,
                slug: item.slug,
                title: item.title,
                priceToman: item.priceToman,
                imageUrl: item.imageUrl,
                weightGram: item.weightGram,
                quantity: item.quantity ?? 1,
              },
            ],
            isOpen: true,
          };
        });
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((line) => line.id !== id),
        }));
      },
      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((line) =>
            line.id === id ? { ...line, quantity } : line,
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      itemCount: () =>
        get().items.reduce((sum, line) => sum + line.quantity, 0),
      total: () =>
        get().items.reduce((sum, line) => sum + line.quantity * line.priceToman, 0),
    }),
    {
      name: 'sadafgold-cart',
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

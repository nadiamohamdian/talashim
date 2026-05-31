'use client';

import { create } from 'zustand';
import type { TradeSide } from './types';

interface TradingUiState {
  side: TradeSide;
  karat: number;
  symbol: string;
  setSide: (side: TradeSide) => void;
  setKarat: (karat: number) => void;
}

export const useTradingStore = create<TradingUiState>((set) => ({
  side: 'BUY',
  karat: 18,
  symbol: 'XAU-IRR',
  setSide: (side) => set({ side }),
  setKarat: (karat) => set({ karat }),
}));

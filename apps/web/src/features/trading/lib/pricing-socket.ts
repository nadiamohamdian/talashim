import { io, type Socket } from 'socket.io-client';
import { getWsBaseUrl } from '@/shared/config/env';
import type { LiveGoldPrice } from '../model/types';

let socket: Socket | null = null;

export function getPricingSocket() {
  if (typeof window === 'undefined') return null;
  if (!socket) {
    socket = io(`${getWsBaseUrl()}/pricing`, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
    });
  }
  return socket;
}

export function subscribeLivePrice(onUpdate: (price: LiveGoldPrice) => void) {
  const client = getPricingSocket();
  if (!client) return () => undefined;

  const handler = (payload: LiveGoldPrice) => onUpdate(payload);
  client.on('price.update', handler);
  if (!client.connected) client.connect();

  return () => {
    client.off('price.update', handler);
  };
}

export function disconnectPricingSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}

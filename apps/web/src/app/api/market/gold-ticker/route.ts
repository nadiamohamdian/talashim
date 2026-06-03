import { NextResponse } from 'next/server';
import { resolveGoldTickerPayload } from '@/lib/market/gold-ticker-from-api';

export const revalidate = 60;

export async function GET() {
  const payload = await resolveGoldTickerPayload();

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}

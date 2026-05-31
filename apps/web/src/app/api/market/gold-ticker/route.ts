import { fetchGoldTickerPayload } from '@sadafgold/shared';
import { NextResponse } from 'next/server';

export const revalidate = 60;

export async function GET() {
  const apiKey = process.env.BRS_API_KEY;

  if (!apiKey && process.env.NODE_ENV === 'development') {
    console.warn(
      '[gold-ticker] BRS_API_KEY is missing. Add it to the repo root .env and restart `pnpm dev:web`.',
    );
  }

  const payload = await fetchGoldTickerPayload({
    apiKey,
    url: process.env.BRS_API_URL,
  });

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}

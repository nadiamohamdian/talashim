import {
  buildFallbackGoldTicker,
  type GoldTickerItem,
  type GoldTickerPayload,
} from '@sadafgold/shared';

type MarketPricesApiResponse = {
  gold_18k: number | null;
  gold_24k: number | null;
  usd: number | null;
  source: string;
  provider?: string;
  updatedAt: string;
  items?: Array<{
    symbol: string;
    name: string;
    price: number;
    changePercent?: number | null;
    unit: string;
    updatedAt?: string | null;
  }>;
};

function mapTickerItems(data: MarketPricesApiResponse): GoldTickerItem[] {
  if (data.items?.length) {
    return data.items.map((item) => ({
      symbol: item.symbol,
      name: item.name,
      price: item.price,
      changePercent: item.changePercent ?? null,
      unit: item.unit,
      updatedAt: item.updatedAt ?? data.updatedAt,
    }));
  }

  const items: GoldTickerItem[] = [];
  const updatedAt = data.updatedAt;

  if (data.gold_18k) {
    items.push({
      symbol: 'IR_GOLD_18K',
      name: 'طلای ۱۸ عیار',
      price: data.gold_18k,
      changePercent: null,
      unit: 'تومان',
      updatedAt,
    });
  }
  if (data.gold_24k) {
    items.push({
      symbol: 'IR_GOLD_24K',
      name: 'طلای ۲۴ عیار',
      price: data.gold_24k,
      changePercent: null,
      unit: 'تومان',
      updatedAt,
    });
  }

  return items;
}

/** Prefer Nest cached market prices (Redis) over direct BrsApi from the web tier. */
export async function fetchGoldTickerFromPlatformApi(
  apiBaseUrl: string,
): Promise<GoldTickerPayload | null> {
  try {
    const base = apiBaseUrl.replace(/\/$/, '');
    const response = await fetch(`${base}/market/prices`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(6_000),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as MarketPricesApiResponse;
    const items = mapTickerItems(data);

    if (items.length === 0) {
      return null;
    }

    const source =
      data.provider === 'brsapi' || data.source === 'brsapi' ? 'brsapi' : 'fallback';

    return {
      source,
      fetchedAt: data.updatedAt,
      items,
    };
  } catch {
    return null;
  }
}

export function resolvePlatformApiBaseUrl(): string {
  const configured =
    process.env.API_INTERNAL_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    'http://localhost:4000/api/v1';

  return configured.replace(/\/$/, '');
}

export async function resolveGoldTickerPayload(): Promise<GoldTickerPayload> {
  const platformPayload = await fetchGoldTickerFromPlatformApi(resolvePlatformApiBaseUrl());
  if (platformPayload) {
    return platformPayload;
  }

  const { fetchGoldTickerPayload } = await import('@sadafgold/shared');
  const apiKey = process.env.BRS_API_KEY;

  if (!apiKey) {
    return buildFallbackGoldTicker();
  }

  return fetchGoldTickerPayload({
    apiKey,
    url: process.env.BRS_API_URL,
  });
}

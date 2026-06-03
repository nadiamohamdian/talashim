import { z } from 'zod';

/** BrsApi free gold/currency quote — see https://brsapi.ir/free-api-gold-currency-webservice/ */
export const brsGoldQuoteSchema = z.object({
  date: z.string().optional(),
  time: z.string().optional(),
  time_unix: z.coerce.number().optional(),
  symbol: z.string(),
  name_en: z.string().optional(),
  name: z.string(),
  price: z.coerce.number(),
  change_value: z.coerce.number().optional(),
  change_percent: z.coerce.number().optional(),
  unit: z.string().optional(),
});

export type BrsGoldQuote = z.infer<typeof brsGoldQuoteSchema>;

export const BRS_GOLD_DEFAULT_URL =
  'https://api.brsapi.ir/Market/Gold_Currency.php';

/** BrsApi Gen-6 firewall blocks default fetch/axios User-Agents — use a real browser string. */
export const BRS_API_BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

/** Preferred display order for the storefront ticker. */
export const GOLD_TICKER_SYMBOLS = [
  'IR_GOLD_18K',
  'IR_GOLD_24K',
  'IR_GOLD_MELTED',
  'IR_GOLD_750',
  'IR_GOLD_999',
  'IR_COIN_EMAMI',
  'IR_COIN_BAHAR',
  'IR_COIN_HALF',
  'IR_COIN_QUARTER',
  'IR_COIN_1G',
] as const;

export type GoldTickerSymbol = (typeof GOLD_TICKER_SYMBOLS)[number];

/** Legacy + current BrsApi symbol aliases (API uses IR_GOLD_18K / IR_GOLD_24K). */
export const BRS_GOLD_SYMBOL_ALIASES: Record<string, readonly string[]> = {
  IR_GOLD_18K: ['IR_GOLD_18', 'IR_GOLD_18K'],
  IR_GOLD_24K: ['IR_GOLD_24', 'IR_GOLD_24K'],
};

export type GoldTickerItem = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number | null;
  unit: string;
  updatedAt: string | null;
};

export type GoldTickerPayload = {
  items: GoldTickerItem[];
  source: 'brsapi' | 'fallback';
  fetchedAt: string;
};

const GOLD_SYMBOL_PREFIXES = ['IR_GOLD', 'GOLD'] as const;
const COIN_SYMBOL_PREFIXES = ['IR_COIN'] as const;

function isGoldOrCoinQuote(quote: BrsGoldQuote): boolean {
  const symbol = quote.symbol.toUpperCase();
  if (GOLD_SYMBOL_PREFIXES.some((prefix) => symbol.startsWith(prefix))) {
    return true;
  }
  if (COIN_SYMBOL_PREFIXES.some((prefix) => symbol.startsWith(prefix))) {
    return true;
  }
  const name = quote.name;
  return name.includes('طلا') || name.includes('سکه') || name.includes('عیار');
}

function normalizeQuotes(raw: unknown): BrsGoldQuote[] {
  if (Array.isArray(raw)) {
    return raw.flatMap((item) => {
      const parsed = brsGoldQuoteSchema.safeParse(item);
      return parsed.success ? [parsed.data] : [];
    });
  }

  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>;
    const nestedKeys = ['gold', 'currency', 'cryptocurrency', 'data', 'items'];

    for (const key of nestedKeys) {
      const value = record[key];
      if (Array.isArray(value)) {
        return normalizeQuotes(value);
      }
      if (value && typeof value === 'object') {
        const nested = normalizeQuotes(value);
        if (nested.length > 0) {
          return nested;
        }
      }
    }

    const values = Object.values(record);
    if (values.every((value) => value && typeof value === 'object')) {
      return normalizeQuotes(values);
    }
  }

  return [];
}

export function parseBrsGoldPayload(raw: unknown): BrsGoldQuote[] {
  return normalizeQuotes(raw).filter(isGoldOrCoinQuote);
}

/** All BrsApi quotes including currencies (USD, EUR, …). */
export function parseBrsAllQuotes(raw: unknown): BrsGoldQuote[] {
  return normalizeQuotes(raw);
}

export function resolveBrsApiEndpoint(options: {
  apiUrl?: string;
  baseUrl?: string;
}): string {
  if (options.apiUrl) {
    return options.apiUrl;
  }

  if (options.baseUrl) {
    const normalized = options.baseUrl.replace(/\/$/, '');
    if (normalized.includes('Gold_Currency.php')) {
      return normalized;
    }

    const host = normalized.includes('api.brsapi.ir')
      ? normalized
      : normalized.replace('://brsapi.ir', '://api.brsapi.ir');

    return `${host}/Market/Gold_Currency.php`;
  }

  return BRS_GOLD_DEFAULT_URL;
}

export function buildBrsApiFetchInit(options?: {
  timeoutMs?: number;
  signal?: AbortSignal;
}): RequestInit {
  const timeoutMs = options?.timeoutMs ?? 8_000;
  return {
    signal: options?.signal ?? AbortSignal.timeout(timeoutMs),
    headers: {
      Accept: 'application/json',
      'User-Agent': BRS_API_BROWSER_USER_AGENT,
    },
  };
}

export async function fetchBrsRawPayload(options: {
  apiKey: string;
  url?: string;
  baseUrl?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
}): Promise<unknown> {
  const endpoint = new URL(
    resolveBrsApiEndpoint({ apiUrl: options.url, baseUrl: options.baseUrl }),
  );
  endpoint.searchParams.set('key', options.apiKey);

  const response = await fetch(endpoint, buildBrsApiFetchInit(options));

  if (!response.ok) {
    throw new Error(`BrsApi responded with ${response.status}`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('json')) {
    throw new Error(`BrsApi returned non-JSON (${contentType || 'unknown'})`);
  }

  return response.json() as Promise<unknown>;
}

function resolveQuoteBySymbol(
  quotes: BrsGoldQuote[],
  symbol: string,
): BrsGoldQuote | undefined {
  const bySymbol = new Map(quotes.map((quote) => [quote.symbol.toUpperCase(), quote]));
  const direct = bySymbol.get(symbol.toUpperCase());
  if (direct) {
    return direct;
  }

  const aliases = BRS_GOLD_SYMBOL_ALIASES[symbol.toUpperCase()];
  if (aliases) {
    for (const alias of aliases) {
      const match = bySymbol.get(alias.toUpperCase());
      if (match) {
        return match;
      }
    }
  }

  return undefined;
}

const USD_SYMBOL_CANDIDATES = ['USD', 'USD_IRR', 'IR_USD', 'USDIRR'] as const;

export function findBrsUsdQuote(quotes: BrsGoldQuote[]): BrsGoldQuote | undefined {
  const bySymbol = new Map(quotes.map((quote) => [quote.symbol.toUpperCase(), quote]));

  for (const symbol of USD_SYMBOL_CANDIDATES) {
    const match = bySymbol.get(symbol);
    if (match) {
      return match;
    }
  }

  return quotes.find((quote) => {
    const symbol = quote.symbol.toUpperCase();
    const name = quote.name;
    return symbol.includes('USD') || name.includes('دلار') || name.toLowerCase().includes('dollar');
  });
}

export type MarketPricesSnapshot = {
  gold18k: number | null;
  gold24k: number | null;
  usd: number | null;
  source: 'brsapi' | 'fallback' | 'cache';
  provider: string;
  updatedAt: string;
  items: GoldTickerItem[];
};

export function buildMarketPricesSnapshot(options: {
  quotes: BrsGoldQuote[];
  fetchedAt: string;
  source: 'brsapi' | 'fallback';
  provider: string;
}): MarketPricesSnapshot {
  const gold18 = findBrsQuoteForKarat(options.quotes, 18);
  const gold24 = findBrsQuoteForKarat(options.quotes, 24);
  const usd = findBrsUsdQuote(options.quotes);

  return {
    gold18k: gold18?.price ?? null,
    gold24k: gold24?.price ?? null,
    usd: usd?.price ?? null,
    source: options.source,
    provider: options.provider,
    updatedAt: options.fetchedAt,
    items: pickGoldTickerQuotes(options.quotes),
  };
}

export function buildFallbackMarketSnapshot(provider = 'fallback'): MarketPricesSnapshot {
  const ticker = buildFallbackGoldTicker();
  return {
    gold18k:
      ticker.items.find((item) => item.symbol === 'IR_GOLD_18K' || item.symbol === 'IR_GOLD_18')
        ?.price ?? null,
    gold24k:
      ticker.items.find((item) => item.symbol === 'IR_GOLD_24K' || item.symbol === 'IR_GOLD_24')
        ?.price ?? null,
    usd: 92_000,
    source: 'fallback',
    provider,
    updatedAt: ticker.fetchedAt,
    items: ticker.items,
  };
}

export function toGoldTickerItem(quote: BrsGoldQuote): GoldTickerItem {
  const updatedAt =
    quote.time_unix != null
      ? new Date(quote.time_unix * 1000).toISOString()
      : quote.date && quote.time
        ? null
        : null;

  return {
    symbol: quote.symbol,
    name: quote.name,
    price: quote.price,
    changePercent: quote.change_percent ?? null,
    unit: quote.unit ?? 'تومان',
    updatedAt,
  };
}

export function pickGoldTickerQuotes(quotes: BrsGoldQuote[]): GoldTickerItem[] {
  const picked: BrsGoldQuote[] = [];

  for (const symbol of GOLD_TICKER_SYMBOLS) {
    const quote = resolveQuoteBySymbol(quotes, symbol);
    if (quote) {
      picked.push(quote);
    }
  }

  if (picked.length === 0) {
    return quotes.slice(0, 8).map(toGoldTickerItem);
  }

  return picked.map(toGoldTickerItem);
}

export function findBrsQuoteForKarat(
  quotes: BrsGoldQuote[],
  karat: number,
): BrsGoldQuote | undefined {
  const preferredSymbol = karat >= 24 ? 'IR_GOLD_24K' : 'IR_GOLD_18K';
  const direct = resolveQuoteBySymbol(quotes, preferredSymbol);
  if (direct) {
    return direct;
  }

  return quotes.find((quote) => {
    const name = quote.name;
    if (karat >= 24) {
      return name.includes('24') && name.includes('عیار');
    }
    return name.includes('18') && name.includes('عیار');
  });
}

export async function fetchBrsGoldQuotes(options: {
  apiKey: string;
  url?: string;
  baseUrl?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
}): Promise<BrsGoldQuote[]> {
  const payload = await fetchBrsRawPayload(options);
  const quotes = parseBrsGoldPayload(payload);

  if (quotes.length === 0) {
    throw new Error('BrsApi returned no gold quotes');
  }

  return quotes;
}

export function buildFallbackGoldTicker(): GoldTickerPayload {
  const now = new Date().toISOString();
  return {
    source: 'fallback',
    fetchedAt: now,
    items: [
      {
        symbol: 'IR_GOLD_18K',
        name: 'طلای ۱۸ عیار',
        price: 8_500_000,
        changePercent: null,
        unit: 'تومان',
        updatedAt: now,
      },
      {
        symbol: 'IR_GOLD_24K',
        name: 'طلای ۲۴ عیار',
        price: 11_300_000,
        changePercent: null,
        unit: 'تومان',
        updatedAt: now,
      },
      {
        symbol: 'IR_COIN_EMAMI',
        name: 'سکه امامی',
        price: 97_000_000,
        changePercent: null,
        unit: 'تومان',
        updatedAt: now,
      },
    ],
  };
}

export async function fetchGoldTickerPayload(options: {
  apiKey?: string;
  url?: string;
}): Promise<GoldTickerPayload> {
  const fetchedAt = new Date().toISOString();

  if (!options.apiKey) {
    return buildFallbackGoldTicker();
  }

  try {
    const quotes = await fetchBrsGoldQuotes({
      apiKey: options.apiKey,
      url: options.url,
    });

    return {
      source: 'brsapi',
      fetchedAt,
      items: pickGoldTickerQuotes(quotes),
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[BrsApi] Gold ticker fetch failed, using fallback: ${message}`);
    }
    return buildFallbackGoldTicker();
  }
}

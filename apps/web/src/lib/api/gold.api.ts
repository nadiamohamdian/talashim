import { fetchGoldTickerPayload, type GoldTickerPayload } from '@sadafgold/shared';

/** Server-side BrsApi gold ticker (uses BRS_API_KEY / BRS_API_URL from env). */
export async function getGoldPrices(): Promise<GoldTickerPayload> {
  return fetchGoldTickerPayload({
    apiKey: process.env.BRS_API_KEY,
    url: process.env.BRS_API_URL,
  });
}

export const goldApi = {
  getPrices: getGoldPrices,
};

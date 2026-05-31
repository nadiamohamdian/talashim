export {
  marketApi,
  executeMarketBuy,
  executeMarketSell,
  getLivePrice as fetchLiveGoldPrice,
  getPriceHistory as fetchGoldPriceHistory,
  getWalletBalances as fetchWalletBalances,
  getWalletTransactions as fetchWalletTransactions,
  getTradeHistory as fetchTradeHistory,
  type MarketTradePayload,
} from '@/lib/api/market.api';

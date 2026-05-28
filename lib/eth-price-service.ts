// lib/eth-price-service.ts
// Fetches and caches ETH/USD/EUR conversion rates from CoinGecko

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,eur';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

let cache: {
  timestamp: number;
  usd: number;
  eur: number;
} | null = null;

export async function getEthRates(): Promise<{ usd: number; eur: number }> {
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
    return { usd: cache.usd, eur: cache.eur };
  }

  try {
    const res = await fetch(COINGECKO_URL);
    const data = await res.json();
    const usd = data?.ethereum?.usd ?? 0;
    const eur = data?.ethereum?.eur ?? 0;
    cache = { timestamp: Date.now(), usd, eur };
    console.log(`ETH rates: $${usd} / €${eur}`);
    return { usd, eur };
  } catch (err) {
    console.error('Failed to fetch ETH rates:', err);
    // Return last cache if available, otherwise fallback
    if (cache) return { usd: cache.usd, eur: cache.eur };
    return { usd: 2500, eur: 2300 }; // fallback
  }
}

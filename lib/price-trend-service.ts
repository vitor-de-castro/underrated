// lib/price-trend-service.ts
// Stores and retrieves hourly price snapshots using Upstash Redis

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const TREND_KEY_PREFIX = 'price:';
const MAX_SNAPSHOTS = 24; // keep 24 hourly snapshots = 24 hours of history

interface PriceSnapshot {
  price: number;
  timestamp: number;
}

// Save current prices to Redis
export async function savePriceSnapshots(players: { slug: string; price: number }[]) {
  try {
    const now = Date.now();
    const pipeline = redis.pipeline();

    for (const player of players) {
      const key = `${TREND_KEY_PREFIX}${player.slug}`;
      const snapshot: PriceSnapshot = { price: player.price, timestamp: now };

      // Push new snapshot to the list
      pipeline.lpush(key, JSON.stringify(snapshot));
      // Keep only last 24 snapshots
      pipeline.ltrim(key, 0, MAX_SNAPSHOTS - 1);
      // Expire after 48 hours to clean up unused keys
      pipeline.expire(key, 48 * 60 * 60);
    }

    await pipeline.exec();
    console.log(`Saved price snapshots for ${players.length} players`);
  } catch (err) {
    console.error('Failed to save price snapshots:', err);
  }
}

// Get price trend for a specific card
export async function getPriceTrend(slug: string): Promise<{
  trend: 'up' | 'down' | 'stable' | null;
  changePercent: number | null;
  snapshots: PriceSnapshot[];
}> {
  try {
    const key = `${TREND_KEY_PREFIX}${slug}`;
    const raw = await redis.lrange(key, 0, MAX_SNAPSHOTS - 1);

    if (!raw || raw.length < 2) {
      return { trend: null, changePercent: null, snapshots: [] };
    }

    const snapshots: PriceSnapshot[] = raw.map((r: any) =>
      typeof r === 'string' ? JSON.parse(r) : r
    );

    const latest = snapshots[0].price;
    const oldest = snapshots[snapshots.length - 1].price;

    if (oldest === 0) return { trend: null, changePercent: null, snapshots };

    const changePercent = ((latest - oldest) / oldest) * 100;
    const trend = changePercent > 2 ? 'up' : changePercent < -2 ? 'down' : 'stable';

    return { trend, changePercent, snapshots };
  } catch (err) {
    console.error('Failed to get price trend:', err);
    return { trend: null, changePercent: null, snapshots: [] };
  }
}

// Get trends for multiple cards at once
export async function getPriceTrends(slugs: string[]): Promise<Map<string, {
  trend: 'up' | 'down' | 'stable' | null;
  changePercent: number | null;
}>> {
  const trendsMap = new Map();

  try {
    const pipeline = redis.pipeline();
    for (const slug of slugs) {
      pipeline.lrange(`${TREND_KEY_PREFIX}${slug}`, 0, MAX_SNAPSHOTS - 1);
    }

    const results = await pipeline.exec();

    for (let i = 0; i < slugs.length; i++) {
      const raw = results[i] as any[];
      if (!raw || raw.length < 2) {
        trendsMap.set(slugs[i], { trend: null, changePercent: null });
        continue;
      }

      const snapshots: PriceSnapshot[] = raw.map((r: any) =>
        typeof r === 'string' ? JSON.parse(r) : r
      );

      const latest = snapshots[0].price;
      const oldest = snapshots[snapshots.length - 1].price;

      if (oldest === 0) {
        trendsMap.set(slugs[i], { trend: null, changePercent: null });
        continue;
      }

      const changePercent = ((latest - oldest) / oldest) * 100;
      const trend = changePercent > 2 ? 'up' : changePercent < -2 ? 'down' : 'stable';
      trendsMap.set(slugs[i], { trend, changePercent });
    }
  } catch (err) {
    console.error('Failed to get price trends:', err);
  }

  return trendsMap;
}

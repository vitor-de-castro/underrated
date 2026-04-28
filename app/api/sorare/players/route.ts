import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SORARE_GRAPHQL_URL = 'https://api.sorare.com/federation/graphql';
const SORARE_JWT_TOKEN = process.env.SORARE_JWT_TOKEN;
const SORARE_JWT_AUD = process.env.SORARE_JWT_AUD || 'underrated';
const CACHE_FILE = path.join(process.cwd(), '.cache', 'players.json');
const CACHE_DURATION = 60 * 60 * 1000;

let memoryCache: { timestamp: number; data: any } | null = null;
let isFetching = false;

const makeQuery = (last: number, before?: string) => `
  query GetLiveAuctions {
    tokens {
      liveAuctions(last: ${last}${before ? `, before: "${before}"` : ''}, sport: FOOTBALL) {
        nodes {
          id
          currentPrice
          anyCards {
            slug
            pictureUrl
            rarityTyped
            ... on Card {
              player {
                displayName
                age
                anyPositions
                activeClub {
                  name
                }
              }
            }
          }
        }
        pageInfo {
          startCursor
          hasPreviousPage
        }
      }
    }
  }
`;

async function fetchAuctions(last: number, before?: string) {
  const response = await fetch(SORARE_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SORARE_JWT_TOKEN}`,
      'JWT-AUD': SORARE_JWT_AUD,
    },
    body: JSON.stringify({ query: makeQuery(last, before) }),
  });
  const data = await response.json();
  return data?.data?.tokens?.liveAuctions;
}

function calculateValueScore(priceInEth: number, rarity: string, age: number): number {
  if (priceInEth === 0) return 0;
  const rarityBase: Record<string, number> = {
    unique: 9.5,
    super_rare: 8.5,
    rare: 7.5,
    limited: 6.5,
  };
  const base = rarityBase[rarity] ?? 6.0;
  const priceScore = Math.max(0, 1 - priceInEth * 3);
  const ageBonus = age < 23 ? 0.5 : age < 26 ? 0.2 : 0;
  const score = base + priceScore + ageBonus;
  return Math.min(parseFloat(score.toFixed(1)), 10);
}

function readCache() {
  if (memoryCache && Date.now() - memoryCache.timestamp < CACHE_DURATION) {
    console.log('Returning memory cache');
    return memoryCache.data;
  }
  try {
    if (!fs.existsSync(CACHE_FILE)) return null;
    const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
    const { timestamp, data } = JSON.parse(raw);
    if (Date.now() - timestamp < CACHE_DURATION) {
      console.log('Returning file cache');
      memoryCache = { timestamp, data };
      return data;
    }
  } catch {
    return null;
  }
  return null;
}

function writeCache(data: any) {
  memoryCache = { timestamp: Date.now(), data };
  try {
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify({ timestamp: Date.now(), data }));
  } catch (err) {
    console.error('Cache write error:', err);
  }
}

async function fetchFreshData() {
  const batch1 = await fetchAuctions(15);
  const nodes1 = batch1?.nodes ?? [];
  const cursor = batch1?.pageInfo?.startCursor;
  const batch2 = cursor ? await fetchAuctions(15, cursor) : { nodes: [] };
  const nodes2 = (batch2 as any)?.nodes ?? [];

  const validAuctions = [...nodes1, ...nodes2].filter(
    (auction: any) => auction.anyCards?.[0]?.player?.displayName
  );

  const players = validAuctions.map((auction: any) => {
    const card = auction.anyCards[0];
    const player = card.player;
    const priceInEth = parseFloat(auction.currentPrice) / 1e18;

    return {
      slug: card.slug,
      displayName: player.displayName,
      position: player.anyPositions?.[0] ?? 'Unknown',
      age: player.age,
      avatarUrl: card.pictureUrl,
      club: { name: player.activeClub?.name || 'Unknown Club' },
      rarity: card.rarityTyped,
      price: priceInEth,
      valueScore: calculateValueScore(priceInEth, card.rarityTyped, player.age),
      stats: { goals: 0, assists: 0 },
    };
  });

  return players.sort((a, b) => b.valueScore - a.valueScore);
}

export async function GET() {
  try {
    const cached = readCache();
    if (cached) return NextResponse.json(cached);

    if (isFetching) {
      console.log('Already fetching, waiting...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      const cached2 = readCache();
      if (cached2) return NextResponse.json(cached2);
    }

    isFetching = true;
    console.log('Fetching fresh Sorare data...');

    const data = await fetchFreshData();
    writeCache(data);
    isFetching = false;

    return NextResponse.json(data);

  } catch (error) {
    isFetching = false;
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

const SORARE_GRAPHQL_URL = 'https://api.sorare.com/federation/graphql';
const SORARE_JWT_TOKEN = process.env.SORARE_JWT_TOKEN;
const SORARE_JWT_AUD = process.env.SORARE_JWT_AUD || 'underrated';

let memoryCache: { timestamp: number; data: any } | null = null;
let isFetching = false;
const CACHE_DURATION = 60 * 60 * 1000;

const makeQuery = (last: number, before?: string) => `
  query GetLiveAuctions {
    tokens {
      liveAuctions(last: ${last}${before ? `, before: "${before}"` : ''}, sport: FOOTBALL) {
        nodes {
          id
          currentPrice
          endDate
          anyCards {
            slug
            pictureUrl
            rarityTyped
            ... on Card {
              latestEnglishAuction {
                currentPrice
                endDate
              }
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
  if (data?.errors) console.log('API errors:', JSON.stringify(data.errors));
  return data?.data?.tokens?.liveAuctions;
}

function calculateValueScore(priceInEth: number, rarity: string, age: number): number {
  if (priceInEth === 0) return 0;
  const rarityBase: Record<string, number> = {
    unique: 9.5, super_rare: 8.5, rare: 7.5, limited: 6.5,
  };
  const base = rarityBase[rarity] ?? 6.0;
  const priceScore = Math.max(0, 1 - priceInEth * 3);
  const ageBonus = age < 23 ? 0.5 : age < 26 ? 0.2 : 0;
  return Math.min(parseFloat((base + priceScore + ageBonus).toFixed(1)), 10);
}

function readMemoryCache() {
  if (memoryCache && Date.now() - memoryCache.timestamp < CACHE_DURATION) {
    return memoryCache.data;
  }
  return null;
}

async function fetchFreshData() {
  const batch1 = await fetchAuctions(15);
  const nodes1 = batch1?.nodes ?? [];
  const cursor1 = batch1?.pageInfo?.startCursor;
  const batch2 = cursor1 ? await fetchAuctions(15, cursor1) : { nodes: [] };
  const nodes2 = (batch2 as any)?.nodes ?? [];

  const validAuctions = [...nodes1, ...nodes2].filter(
    (auction: any) => auction.anyCards?.[0]?.player?.displayName
  );

  console.log(`Total cards: ${validAuctions.length}`);
  if (validAuctions.length > 0) {
    console.log('Sample card:', JSON.stringify(validAuctions[0]?.anyCards?.[0], null, 2));
  }

  const players = validAuctions.map((auction: any) => {
    const card = auction.anyCards[0];
    const player = card.player;
    const auctionPriceInEth = parseFloat(auction.currentPrice) / 1e18;

    return {
      slug: card.slug,
      displayName: player.displayName,
      position: player.anyPositions?.[0] ?? 'Unknown',
      age: player.age,
      avatarUrl: card.pictureUrl,
      club: { name: player.activeClub?.name || 'Unknown Club' },
      rarity: card.rarityTyped,
      price: auctionPriceInEth,
      floorPrice: null,
      endTime: auction.endDate ?? null,
      valueScore: calculateValueScore(auctionPriceInEth, card.rarityTyped, player.age),
      stats: { goals: 0, assists: 0 },
    };
  });

  return players.sort((a, b) => b.valueScore - a.valueScore);
}

export async function GET() {
  try {
    const cached = readMemoryCache();
    if (cached) {
      console.log('Returning memory cache');
      return NextResponse.json(cached);
    }

    if (isFetching) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const cached2 = readMemoryCache();
      if (cached2) return NextResponse.json(cached2);
    }

    isFetching = true;
    console.log('Fetching fresh data...');

    const data = await fetchFreshData();
    memoryCache = { timestamp: Date.now(), data };
    isFetching = false;

    return NextResponse.json(data);

  } catch (error) {
    isFetching = false;
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

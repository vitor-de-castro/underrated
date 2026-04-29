import { NextResponse } from 'next/server';
import { getAllPlayerStats, lookupStats, calculateValueScore } from '@/lib/stats-service';

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

  const statsMap = await getAllPlayerStats();

  const players = validAuctions.map((auction: any) => {
    const card = auction.anyCards[0];
    const player = card.player;
    const priceInEth = parseFloat(auction.currentPrice) / 1e18;
    const stats = lookupStats(player.displayName, statsMap);
    const position = player.anyPositions?.[0] ?? '';

    console.log(`${player.displayName} (${player.activeClub?.name}): goals=${stats.goals}, assists=${stats.assists}, mins=${stats.minutesPlayed}`);

    return {
      slug: card.slug,
      displayName: player.displayName,
      position,
      age: player.age,
      avatarUrl: card.pictureUrl,
      club: { name: player.activeClub?.name || 'Unknown Club' },
      rarity: card.rarityTyped,
      price: priceInEth,
      valueScore: calculateValueScore(
        priceInEth,
        stats.goals,
        stats.assists,
        stats.minutesPlayed,
        card.rarityTyped,
        player.age,
        position
      ),
      stats: { goals: stats.goals, assists: stats.assists },
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

import { NextResponse } from 'next/server';

const SORARE_GRAPHQL_URL = 'https://api.sorare.com/federation/graphql';
const SORARE_JWT_TOKEN = process.env.SORARE_JWT_TOKEN;
const SORARE_JWT_AUD = process.env.SORARE_JWT_AUD || 'underrated';

let memoryCache: { timestamp: number; data: any; cursor: string | null } | null = null;
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

function mapAuctions(auctions: any[]) {
  return auctions
    .filter((auction: any) => auction.anyCards?.[0]?.player?.displayName)
    .map((auction: any) => {
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
        endTime: auction.endDate ?? null,
        valueScore: calculateValueScore(priceInEth, card.rarityTyped, player.age),
        stats: { goals: 0, assists: 0 },
      };
    });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const loadMore = searchParams.get('loadMore') === 'true';
    const cursor = searchParams.get('cursor');

    // Initial load — use cache
    if (!loadMore) {
      if (memoryCache && Date.now() - memoryCache.timestamp < CACHE_DURATION) {
        console.log('Returning memory cache');
        return NextResponse.json({
          players: memoryCache.data,
          nextCursor: memoryCache.cursor,
          hasMore: !!memoryCache.cursor,
        });
      }

      if (isFetching) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        if (memoryCache) {
          return NextResponse.json({
            players: memoryCache.data,
            nextCursor: memoryCache.cursor,
            hasMore: !!memoryCache.cursor,
          });
        }
      }

      isFetching = true;
      console.log('Fetching fresh data...');

      const batch1 = await fetchAuctions(15);
      const nodes1 = batch1?.nodes ?? [];
      const cursor1 = batch1?.pageInfo?.startCursor;
      const batch2 = cursor1 ? await fetchAuctions(15, cursor1) : { nodes: [], pageInfo: {} };
      const nodes2 = (batch2 as any)?.nodes ?? [];
      const nextCursor = (batch2 as any)?.pageInfo?.startCursor ?? null;

      const players = mapAuctions([...nodes1, ...nodes2])
        .sort((a, b) => b.valueScore - a.valueScore);

      console.log(`Total cards: ${players.length}, hasMore: ${!!nextCursor}`);

      memoryCache = { timestamp: Date.now(), data: players, cursor: nextCursor };
      isFetching = false;

      return NextResponse.json({ players, nextCursor, hasMore: !!nextCursor });
    }

    // Load more — fetch next batch using cursor
    if (!cursor) return NextResponse.json({ players: [], nextCursor: null, hasMore: false });

    console.log('Loading more cards...');
    const batch1 = await fetchAuctions(15, cursor);
    const nodes1 = batch1?.nodes ?? [];
    const cursor1 = batch1?.pageInfo?.startCursor;
    const batch2 = cursor1 ? await fetchAuctions(15, cursor1) : { nodes: [], pageInfo: {} };
    const nodes2 = (batch2 as any)?.nodes ?? [];
    const nextCursor = (batch2 as any)?.pageInfo?.startCursor ?? null;

    const players = mapAuctions([...nodes1, ...nodes2])
      .sort((a, b) => b.valueScore - a.valueScore);

    console.log(`Loaded ${players.length} more cards`);

    return NextResponse.json({ players, nextCursor, hasMore: !!nextCursor });

  } catch (error) {
    isFetching = false;
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getFPLData, lookupFPLPlayer } from '@/lib/fpl-service';
import { savePriceSnapshots, getPriceTrends } from '@/lib/price-trend-service';
import { getEthRates } from '@/lib/eth-price-service';

const SORARE_GRAPHQL_URL = 'https://api.sorare.com/federation/graphql';
const SORARE_JWT_TOKEN = process.env.SORARE_JWT_TOKEN;
const SORARE_JWT_AUD = process.env.SORARE_JWT_AUD || 'underrated';

let memoryCache: { timestamp: number; data: any; cursor: string | null; ethRates: { usd: number; eur: number } } | null = null;
let isFetching = false;
const CACHE_DURATION = 60 * 60 * 1000;

const PREMIER_LEAGUE_CLUBS = [
  'arsenal', 'chelsea', 'liverpool', 'manchester city', 'manchester united',
  'tottenham', 'newcastle', 'west ham', 'aston villa', 'brighton',
  'fulham', 'brentford', 'crystal palace', 'everton', 'leicester',
  'wolves', 'wolverhampton', 'nottingham forest', 'bournemouth', 'southampton',
  'ipswich', 'burnley', 'luton', 'sheffield united',
];

function isPremierLeagueClub(clubName: string): boolean {
  if (!clubName) return false;
  const lower = clubName.toLowerCase();
  return PREMIER_LEAGUE_CLUBS.some(club => lower.includes(club) || club.includes(lower));
}

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

function calculateValueScore(
  priceInEth: number,
  rarity: string,
  age: number,
  avgPriceForRarity: number,
  fplData?: { form: string; status: string } | null
): number {
  if (priceInEth === 0) return 0;

  let priceContextScore = 5.0;
  if (avgPriceForRarity > 0) {
    const ratio = priceInEth / avgPriceForRarity;
    if (ratio < 0.5) priceContextScore = 8.5;
    else if (ratio < 0.65) priceContextScore = 7.5;
    else if (ratio < 0.8) priceContextScore = 6.5;
    else if (ratio < 0.9) priceContextScore = 6.0;
    else if (ratio < 1.1) priceContextScore = 5.5;
    else if (ratio < 1.25) priceContextScore = 4.5;
    else if (ratio < 1.5) priceContextScore = 3.5;
    else if (ratio < 2.0) priceContextScore = 2.5;
    else priceContextScore = 1.5;
  }

  const ageBonus = age < 21 ? 0.5 : age < 24 ? 0.3 : age < 27 ? 0.1 : 0;

  const rarityBonus: Record<string, number> = {
    unique: 0.5,
    super_rare: 0.3,
    rare: 0.1,
    limited: 0,
  };
  const rBonus = rarityBonus[rarity] ?? 0;

  let fplBonus = 0;
  if (fplData) {
    if (fplData.status === 'i' || fplData.status === 'u') fplBonus -= 1.0;
    else if (fplData.status === 'd') fplBonus -= 0.5;
    else if (fplData.status === 's') fplBonus -= 0.7;

    const form = parseFloat(fplData.form);
    if (form >= 8) fplBonus += 0.5;
    else if (form >= 6) fplBonus += 0.3;
    else if (form <= 2) fplBonus -= 0.2;
  }

  const score = priceContextScore + ageBonus + rBonus + fplBonus;
  return Math.min(Math.max(parseFloat(score.toFixed(1)), 0), 10);
}

function readMemoryCache() {
  if (memoryCache && Date.now() - memoryCache.timestamp < CACHE_DURATION) {
    return memoryCache;
  }
  return null;
}

function computeAvgPrices(auctions: any[]): Record<string, number> {
  const rarityGroups: Record<string, number[]> = {};
  auctions.forEach((auction: any) => {
    const card = auction.anyCards?.[0];
    if (!card?.rarityTyped) return;
    const price = parseFloat(auction.currentPrice) / 1e18;
    if (!rarityGroups[card.rarityTyped]) rarityGroups[card.rarityTyped] = [];
    rarityGroups[card.rarityTyped].push(price);
  });
  const avgPrices: Record<string, number> = {};
  Object.entries(rarityGroups).forEach(([rarity, prices]) => {
    avgPrices[rarity] = prices.reduce((a, b) => a + b, 0) / prices.length;
  });
  return avgPrices;
}

async function mapAuctions(auctions: any[], avgPrices: Record<string, number>) {
  const fplMap = await getFPLData();
  const validAuctions = auctions.filter((auction: any) => auction.anyCards?.[0]?.player?.displayName);

  const snapshots = validAuctions.map((auction: any) => ({
    slug: auction.anyCards[0].slug,
    price: parseFloat(auction.currentPrice) / 1e18,
  }));
  await savePriceSnapshots(snapshots);

  const slugs = snapshots.map(s => s.slug);
  const trendsMap = await getPriceTrends(slugs);

  return validAuctions.map((auction: any) => {
    const card = auction.anyCards[0];
    const player = card.player;
    const priceInEth = parseFloat(auction.currentPrice) / 1e18;
    const clubName = player.activeClub?.name ?? '';

    let fplData = null;
    if (isPremierLeagueClub(clubName)) {
      const fplPlayer = lookupFPLPlayer(player.displayName, fplMap);
      if (fplPlayer) {
        fplData = {
          form: fplPlayer.form,
          totalPoints: fplPlayer.total_points,
          minutes: fplPlayer.minutes,
          goalsScored: fplPlayer.goals_scored,
          assists: fplPlayer.assists,
          expectedGoals: fplPlayer.expected_goals,
          expectedAssists: fplPlayer.expected_assists,
          status: fplPlayer.status,
          news: fplPlayer.news,
        };
      }
    }

    const trend = trendsMap.get(card.slug) ?? { trend: null, changePercent: null };

    return {
      slug: card.slug,
      displayName: player.displayName,
      position: player.anyPositions?.[0] ?? 'Unknown',
      age: player.age,
      avatarUrl: card.pictureUrl,
      club: { name: clubName || 'Unknown Club' },
      rarity: card.rarityTyped,
      price: priceInEth,
      endTime: auction.endDate ?? null,
      valueScore: calculateValueScore(
        priceInEth,
        card.rarityTyped,
        player.age,
        avgPrices[card.rarityTyped] ?? 0,
        fplData ? { form: fplData.form, status: fplData.status } : null
      ),
      stats: { goals: 0, assists: 0 },
      fplData,
      priceTrend: trend.trend,
      priceChangePercent: trend.changePercent,
    };
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const loadMore = searchParams.get('loadMore') === 'true';
    const forceRefresh = searchParams.get('refresh') === 'true';
    const cursor = searchParams.get('cursor');

    if (loadMore) {
      if (!cursor) return NextResponse.json({ players: [], nextCursor: null, hasMore: false });
      const batch1 = await fetchAuctions(15, cursor);
      const nodes1 = batch1?.nodes ?? [];
      const cursor1 = batch1?.pageInfo?.startCursor;
      const batch2 = cursor1 ? await fetchAuctions(15, cursor1) : { nodes: [], pageInfo: {} };
      const nodes2 = (batch2 as any)?.nodes ?? [];
      const nextCursor = (batch2 as any)?.pageInfo?.startCursor ?? null;
      const allAuctions = [...nodes1, ...nodes2];
      const avgPrices = computeAvgPrices(allAuctions);
      const ethRates = await getEthRates();
      const players = (await mapAuctions(allAuctions, avgPrices))
        .sort((a, b) => b.valueScore - a.valueScore);
      return NextResponse.json({ players, nextCursor, hasMore: !!nextCursor, ethRates });
    }

    if (forceRefresh) {
      console.log('Force refreshing data...');
      memoryCache = null;
    }

    const cached = readMemoryCache();
    if (cached) {
      console.log('Returning memory cache');
      return NextResponse.json({
        players: cached.data,
        nextCursor: cached.cursor,
        hasMore: !!cached.cursor,
        ethRates: cached.ethRates,
      });
    }

    if (isFetching) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const cached2 = readMemoryCache();
      if (cached2) return NextResponse.json({
        players: cached2.data,
        nextCursor: cached2.cursor,
        hasMore: !!cached2.cursor,
        ethRates: cached2.ethRates,
      });
    }

    isFetching = true;
    console.log('Fetching fresh data...');

    const batch1 = await fetchAuctions(15);
    const nodes1 = batch1?.nodes ?? [];
    const cursor1 = batch1?.pageInfo?.startCursor;

    const batch2 = cursor1 ? await fetchAuctions(15, cursor1) : { nodes: [], pageInfo: {} };
    const nodes2 = (batch2 as any)?.nodes ?? [];
    const cursor2 = (batch2 as any)?.pageInfo?.startCursor;

    const batch3 = cursor2 ? await fetchAuctions(15, cursor2) : { nodes: [], pageInfo: {} };
    const nodes3 = (batch3 as any)?.nodes ?? [];
    const cursor3 = (batch3 as any)?.pageInfo?.startCursor;

    const batch4 = cursor3 ? await fetchAuctions(15, cursor3) : { nodes: [], pageInfo: {} };
    const nodes4 = (batch4 as any)?.nodes ?? [];
    const nextCursor = (batch4 as any)?.pageInfo?.startCursor ?? null;

    const allAuctions = [...nodes1, ...nodes2, ...nodes3, ...nodes4];
    const avgPrices = computeAvgPrices(allAuctions);
    const ethRates = await getEthRates();
    const players = (await mapAuctions(allAuctions, avgPrices))
      .sort((a, b) => b.valueScore - a.valueScore);

    console.log(`Total cards: ${players.length}`);
    memoryCache = { timestamp: Date.now(), data: players, cursor: nextCursor, ethRates };
    isFetching = false;

    return NextResponse.json({ players, nextCursor, hasMore: !!nextCursor, ethRates });

  } catch (error) {
    isFetching = false;
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

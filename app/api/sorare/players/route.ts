import { NextResponse } from 'next/server';
import { getAllPlayerStats, lookupStats, calculateValueScore } from '@/lib/stats-service';

const SORARE_GRAPHQL_URL = 'https://api.sorare.com/federation/graphql';
const SORARE_JWT_TOKEN = process.env.SORARE_JWT_TOKEN;
const SORARE_JWT_AUD = process.env.SORARE_JWT_AUD || 'underrated';

let memoryCache: { timestamp: number; data: any } | null = null;
let isFetching = false;
const CACHE_DURATION = 60 * 60 * 1000;

// Known European league clubs — used to filter out MLS/Asian league players
const EUROPEAN_LEAGUES = [
  // Premier League
  'Arsenal', 'Chelsea', 'Liverpool', 'Manchester City', 'Manchester United',
  'Tottenham', 'Newcastle', 'West Ham', 'Aston Villa', 'Brighton',
  'Fulham', 'Brentford', 'Crystal Palace', 'Everton', 'Leicester',
  'Wolves', 'Nottingham Forest', 'Bournemouth', 'Southampton', 'Ipswich',
  // La Liga
  'Real Madrid', 'FC Barcelona', 'Atletico Madrid', 'Sevilla', 'Valencia',
  'Athletic Club', 'Real Sociedad', 'Villarreal', 'Real Betis', 'Getafe',
  'Osasuna', 'Girona', 'Mallorca', 'Celta Vigo', 'Rayo Vallecano',
  'Alaves', 'Leganes', 'Valladolid', 'Las Palmas', 'Espanyol',
  // Bundesliga
  'Bayern Munich', 'Borussia Dortmund', 'Bayer Leverkusen', 'RB Leipzig',
  'Eintracht Frankfurt', 'Wolfsburg', 'Freiburg', 'Hoffenheim', 'Mainz',
  'Borussia Monchengladbach', 'Augsburg', 'Union Berlin', 'Werder Bremen',
  'VfB Stuttgart', 'Heidenheim', 'Kiel', 'St. Pauli', 'Bochum',
  // Serie A
  'Juventus', 'AC Milan', 'Inter Milan', 'Napoli', 'AS Roma', 'Lazio',
  'Fiorentina', 'Atalanta', 'Torino', 'Bologna', 'Udinese', 'Sampdoria',
  'Sassuolo', 'Empoli', 'Spezia', 'Monza', 'Lecce', 'Cagliari', 'Verona', 'Como',
  // Ligue 1
  'Paris Saint-Germain', 'Olympique de Marseille', 'Olympique Lyonnais',
  'Monaco', 'Lille', 'Nice', 'Lens', 'Rennes', 'Strasbourg', 'Nantes',
  'Montpellier', 'Reims', 'Toulouse', 'Brest', 'Le Havre', 'Auxerre',
  // Eredivisie
  'Ajax', 'PSV Eindhoven', 'Feyenoord', 'AZ Alkmaar', 'Utrecht',
  // Primeira Liga
  'Benfica', 'FC Porto', 'Sporting CP', 'Braga',
  // Other major European
  'Celtic', 'Rangers', 'Club Brugge', 'Anderlecht',
];

function isEuropeanClub(clubName: string): boolean {
  if (!clubName) return false;
  const lower = clubName.toLowerCase();
  return EUROPEAN_LEAGUES.some(club =>
    lower.includes(club.toLowerCase()) || club.toLowerCase().includes(lower)
  );
}

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
  // Fetch more cards so we have enough after European filtering
  const batch1 = await fetchAuctions(15);
  const nodes1 = batch1?.nodes ?? [];
  const cursor = batch1?.pageInfo?.startCursor;
  const batch2 = cursor ? await fetchAuctions(15, cursor) : { nodes: [] };
  const nodes2 = (batch2 as any)?.nodes ?? [];

  const allAuctions = [...nodes1, ...nodes2].filter(
    (auction: any) => auction.anyCards?.[0]?.player?.displayName
  );

  // Filter to European clubs only
  const europeanAuctions = allAuctions.filter((auction: any) => {
    const clubName = auction.anyCards?.[0]?.player?.activeClub?.name ?? '';
    return isEuropeanClub(clubName);
  });

  console.log(`Total cards: ${allAuctions.length}, European: ${europeanAuctions.length}`);

  // Fetch stats
  const statsMap = await getAllPlayerStats();

  const players = europeanAuctions.map((auction: any) => {
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

// lib/stats-service.ts
// Fetches and caches player stats from FPL and football-data.org

const FOOTBALL_DATA_KEY = process.env.FOOTBALL_DATA_API_KEY!;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// In-memory cache for stats
let statsCache: {
  timestamp: number;
  data: Map<string, { goals: number; assists: number; minutesPlayed: number }>;
} | null = null;

// Normalize player name for matching
// e.g. "Erling Haaland" -> "erlinghaaland"
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');
}

// Fetch FPL stats for all Premier League players
async function fetchFPLStats(): Promise<Map<string, { goals: number; assists: number; minutesPlayed: number }>> {
  const map = new Map<string, { goals: number; assists: number; minutesPlayed: number }>();
  try {
    const res = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/', {
      headers: { 'User-Agent': 'underrated.live' },
    });
    const data = await res.json();
    const players = data?.elements ?? [];
    for (const p of players) {
      const key = normalizeName(`${p.first_name} ${p.second_name}`);
      map.set(key, {
        goals: p.goals_scored ?? 0,
        assists: p.assists ?? 0,
        minutesPlayed: p.minutes ?? 0,
      });
    }
    console.log(`FPL: loaded ${map.size} players`);
  } catch (err) {
    console.error('FPL fetch error:', err);
  }
  return map;
}

// Fetch top scorers from football-data.org for a competition
async function fetchLeagueScorers(competitionCode: string): Promise<Map<string, { goals: number; assists: number; minutesPlayed: number }>> {
  const map = new Map<string, { goals: number; assists: number; minutesPlayed: number }>();
  try {
    const res = await fetch(
      `https://api.football-data.org/v4/competitions/${competitionCode}/scorers?limit=100`,
      { headers: { 'X-Auth-Token': FOOTBALL_DATA_KEY } }
    );
    const data = await res.json();
    const scorers = data?.scorers ?? [];
    for (const s of scorers) {
      const key = normalizeName(s.player?.name ?? '');
      if (key) {
        map.set(key, {
          goals: s.goals ?? 0,
          assists: s.assists ?? 0,
          minutesPlayed: s.playedMatches ? s.playedMatches * 80 : 0, // estimate
        });
      }
    }
    console.log(`${competitionCode}: loaded ${map.size} scorers`);
  } catch (err) {
    console.error(`football-data.org ${competitionCode} error:`, err);
  }
  return map;
}

// Merge multiple maps into one
function mergeMaps(
  ...maps: Map<string, { goals: number; assists: number; minutesPlayed: number }>[]
): Map<string, { goals: number; assists: number; minutesPlayed: number }> {
  const merged = new Map<string, { goals: number; assists: number; minutesPlayed: number }>();
  for (const map of maps) {
    for (const [key, value] of map) {
      if (!merged.has(key)) {
        merged.set(key, value);
      }
    }
  }
  return merged;
}

// Main function — returns cached stats or fetches fresh
export async function getAllPlayerStats(): Promise<Map<string, { goals: number; assists: number; minutesPlayed: number }>> {
  if (statsCache && Date.now() - statsCache.timestamp < CACHE_DURATION) {
    console.log('Returning cached stats');
    return statsCache.data;
  }

  console.log('Fetching fresh player stats...');

  // Fetch FPL (Premier League)
  const fplStats = await fetchFPLStats();

  // Fetch other leagues from football-data.org
  // Add delay between requests to respect rate limit
  const laLiga = await fetchLeagueScorers('PD');
  await new Promise(r => setTimeout(r, 6000));
  const bundesliga = await fetchLeagueScorers('BL1');
  await new Promise(r => setTimeout(r, 6000));
  const serieA = await fetchLeagueScorers('SA');
  await new Promise(r => setTimeout(r, 6000));
  const ligue1 = await fetchLeagueScorers('FL1');
  await new Promise(r => setTimeout(r, 6000));
  const championsLeague = await fetchLeagueScorers('CL');

  // Merge all — FPL takes priority for PL players
  const allStats = mergeMaps(fplStats, laLiga, bundesliga, serieA, ligue1, championsLeague);

  statsCache = { timestamp: Date.now(), data: allStats };
  console.log(`Total stats loaded: ${allStats.size} players`);

  return allStats;
}

// Look up a player's stats by name
export function lookupStats(
  name: string,
  statsMap: Map<string, { goals: number; assists: number; minutesPlayed: number }>
): { goals: number; assists: number; minutesPlayed: number } {
  const key = normalizeName(name);

  // Try exact match first
  if (statsMap.has(key)) {
    return statsMap.get(key)!;
  }

  // Try partial match — check if any key contains the last name
  const lastName = key.slice(Math.max(0, key.length - 8)); // last ~8 chars
  for (const [k, v] of statsMap) {
    if (k.includes(lastName) && lastName.length > 4) {
      return v;
    }
  }

  return { goals: 0, assists: 0, minutesPlayed: 0 };
}

export function calculateValueScore(
  priceInEth: number,
  goals: number,
  assists: number,
  minutesPlayed: number,
  rarity: string,
  age: number,
  position: string
): number {
  if (priceInEth === 0) return 0;

  let performance = 0;
  const pos = position?.toLowerCase() ?? '';

  if (pos.includes('forward')) {
    performance = (goals * 3) + (assists * 2) + (minutesPlayed / 90);
  } else if (pos.includes('midfielder')) {
    performance = (goals * 2) + (assists * 3) + (minutesPlayed / 90);
  } else if (pos.includes('defender')) {
    performance = (minutesPlayed / 90) * 2;
  } else if (pos.includes('goalkeeper')) {
    performance = (minutesPlayed / 90) * 3;
  } else {
    performance = (goals * 2) + (assists * 2) + (minutesPlayed / 90);
  }

  if (performance > 0) {
    const rawScore = performance / priceInEth;
    const normalized = Math.min(rawScore / 100, 1) * 10;
    return parseFloat(normalized.toFixed(1));
  }

  // Fallback if no stats found
  const rarityBase: Record<string, number> = {
    unique: 9.5, super_rare: 8.5, rare: 7.5, limited: 6.5,
  };
  const base = rarityBase[rarity] ?? 6.0;
  const priceScore = Math.max(0, 1 - priceInEth * 3);
  const ageBonus = age < 23 ? 0.5 : age < 26 ? 0.2 : 0;
  return Math.min(parseFloat((base + priceScore + ageBonus).toFixed(1)), 10);
}

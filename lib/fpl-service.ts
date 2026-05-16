// lib/fpl-service.ts
// Fetches and caches FPL data once per day

const FPL_URL = 'https://fantasy.premierleague.com/api/bootstrap-static/';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface FPLPlayer {
  id: number;
  first_name: string;
  second_name: string;
  web_name: string;
  team: number;
  element_type: number; // 1=GK, 2=DEF, 3=MID, 4=FWD
  status: string; // a=available, d=doubtful, i=injured, s=suspended, u=unavailable
  news: string;
  form: string;
  total_points: number;
  minutes: number;
  goals_scored: number;
  assists: number;
  expected_goals: string;
  expected_assists: string;
  expected_goal_involvements: string;
}

let fplCache: {
  timestamp: number;
  players: Map<string, FPLPlayer>;
} | null = null;

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s]/g, '')
    .trim();
}

export async function getFPLData(): Promise<Map<string, FPLPlayer>> {
  if (fplCache && Date.now() - fplCache.timestamp < CACHE_DURATION) {
    return fplCache.players;
  }

  console.log('Fetching fresh FPL data...');
  try {
    const res = await fetch(FPL_URL, {
      headers: { 'User-Agent': 'underrated.live' },
      next: { revalidate: 86400 },
    });
    const data = await res.json();
    const elements: FPLPlayer[] = data.elements ?? [];

    const playerMap = new Map<string, FPLPlayer>();

    for (const p of elements) {
      // Store by multiple name formats for better matching
      const fullName = normalizeName(`${p.first_name} ${p.second_name}`);
      const webName = normalizeName(p.web_name);
      const lastName = normalizeName(p.second_name);
      const firstName = normalizeName(p.first_name);

      playerMap.set(fullName, p);
      playerMap.set(webName, p);
      // Store first+last initial for partial matching
      if (lastName.length > 3) playerMap.set(lastName, p);
      if (firstName.length > 4 && lastName.length > 4) {
        playerMap.set(`${firstName} ${lastName}`, p);
      }
    }

    console.log(`FPL: loaded ${elements.length} players`);
    fplCache = { timestamp: Date.now(), players: playerMap };
    return playerMap;

  } catch (err) {
    console.error('FPL fetch error:', err);
    return new Map();
  }
}

export function lookupFPLPlayer(sorareDisplayName: string, fplMap: Map<string, FPLPlayer>): FPLPlayer | null {
  const normalized = normalizeName(sorareDisplayName);

  // Exact match
  if (fplMap.has(normalized)) return fplMap.get(normalized)!;

  // Split into parts and try combinations
  const parts = normalized.split(' ').filter(p => p.length > 2);

  // Try last name
  if (parts.length > 0) {
    const lastName = parts[parts.length - 1];
    if (lastName.length > 3 && fplMap.has(lastName)) return fplMap.get(lastName)!;
  }

  // Try first name + last name
  if (parts.length >= 2) {
    const firstLast = `${parts[0]} ${parts[parts.length - 1]}`;
    if (fplMap.has(firstLast)) return fplMap.get(firstLast)!;
  }

  // Fuzzy — check if any key contains the last name
  if (parts.length > 0) {
    const lastName = parts[parts.length - 1];
    if (lastName.length >= 5) {
      for (const [key, val] of fplMap) {
        if (key.includes(lastName) || lastName.includes(key.split(' ').pop() ?? '')) {
          return val;
        }
      }
    }
  }

  return null;
}

export function getStatusLabel(status: string): { label: string; color: string } {
  switch (status) {
    case 'a': return { label: '✅ Available', color: '#10b981' };
    case 'd': return { label: '⚠️ Doubtful', color: '#f59e0b' };
    case 'i': return { label: '🚑 Injured', color: '#ef4444' };
    case 's': return { label: '🟥 Suspended', color: '#ef4444' };
    case 'u': return { label: '❌ Unavailable', color: '#6b7280' };
    default: return { label: '❓ Unknown', color: '#6b7280' };
  }
}

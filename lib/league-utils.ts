// lib/league-utils.ts
// Maps club names to leagues

const LEAGUE_CLUBS: Record<string, string[]> = {
  premier_league: [
    'arsenal', 'chelsea', 'liverpool', 'manchester city', 'manchester united',
    'tottenham', 'newcastle', 'west ham', 'aston villa', 'brighton',
    'fulham', 'brentford', 'crystal palace', 'everton', 'leicester',
    'wolves', 'nottingham forest', 'bournemouth', 'southampton', 'ipswich',
    'burnley', 'luton', 'sheffield united',
  ],
  la_liga: [
    'real madrid', 'barcelona', 'atletico madrid', 'sevilla', 'valencia',
    'athletic club', 'real sociedad', 'villarreal', 'real betis', 'getafe',
    'osasuna', 'girona', 'mallorca', 'celta vigo', 'rayo vallecano',
    'alaves', 'leganes', 'valladolid', 'las palmas', 'espanyol', 'elche',
  ],
  bundesliga: [
    'bayern munich', 'borussia dortmund', 'bayer leverkusen', 'rb leipzig',
    'eintracht frankfurt', 'wolfsburg', 'freiburg', 'hoffenheim', 'mainz',
    'borussia monchengladbach', 'augsburg', 'union berlin', 'werder bremen',
    'vfb stuttgart', 'heidenheim', 'st. pauli', 'bochum', 'greuther furth',
    'karlsruher', 'hamburger', 'hannover', 'schalke', 'hertha',
  ],
  serie_a: [
    'juventus', 'ac milan', 'inter milan', 'napoli', 'as roma', 'lazio',
    'fiorentina', 'atalanta', 'torino', 'bologna', 'udinese', 'sampdoria',
    'sassuolo', 'empoli', 'monza', 'lecce', 'cagliari', 'verona', 'como',
    'genoa', 'parma', 'venezia',
  ],
  ligue_1: [
    'paris saint-germain', 'olympique de marseille', 'olympique lyonnais',
    'monaco', 'lille', 'nice', 'lens', 'rennes', 'strasbourg', 'nantes',
    'montpellier', 'reims', 'toulouse', 'brest', 'le havre', 'auxerre',
    'lorient', 'metz', 'clermont', 'saint-etienne', 'angers',
  ],
  mls: [
    'inter miami', 'la galaxy', 'lafc', 'seattle sounders', 'portland timbers',
    'new york city', 'new york red bulls', 'atlanta united', 'orlando city',
    'nashville', 'austin fc', 'charlotte fc', 'chicago fire', 'colorado rapids',
    'columbus crew', 'fc dallas', 'houston dynamo', 'minnesota united',
    'new england revolution', 'philadelphia union', 'real salt lake',
    'san jose earthquakes', 'sporting kansas city', 'toronto fc',
    'vancouver whitecaps', 'dc united', 'montreal', 'cincinnati', 'st. louis',
    'san diego', 'st. louis city',
  ],
};

export function getLeagueForClub(clubName: string): string {
  if (!clubName) return 'other';
  const lower = clubName.toLowerCase();
  for (const [league, clubs] of Object.entries(LEAGUE_CLUBS)) {
    if (clubs.some(club => lower.includes(club) || club.includes(lower))) {
      return league;
    }
  }
  return 'other';
}

export function isEuropeanLeague(league: string): boolean {
  return ['premier_league', 'la_liga', 'bundesliga', 'serie_a', 'ligue_1'].includes(league);
}

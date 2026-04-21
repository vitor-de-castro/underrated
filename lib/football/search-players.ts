const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY;

export async function searchPlayerByName(playerName: string, teamName: string, season: number = 2023) {
  try {
    // Add league=39 (Premier League)
    const response = await fetch(
      `https://v3.football.api-sports.io/players?league=39&season=${season}&search=${encodeURIComponent(playerName)}`,
      {
        headers: {
          'x-apisports-key': FOOTBALL_API_KEY || '',
        },
      }
    );

    const data = await response.json();

    if (!data.response || data.response.length === 0) {
      console.warn(`No results for: ${playerName}`);
      return null;
    }

    // Find the player in the specified team
    const playerData = data.response.find((p: any) =>
      p.statistics.some((s: any) => s.team.name.toLowerCase().includes(teamName.toLowerCase()))
    );

    if (!playerData) {
      console.warn(`Player ${playerName} not found in team ${teamName}`);
      return null;
    }

    // Get Premier League stats
    const stats = playerData.statistics.find((s: any) => s.league.name === 'Premier League')
      || playerData.statistics[0];

    return {
      player: playerData.player,
      stats: stats,
    };
  } catch (error) {
    console.error(`Error fetching ${playerName}:`, error);
    return null;
  }
}

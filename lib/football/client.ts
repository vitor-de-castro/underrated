const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY;
const BASE_URL = 'https://v3.football.api-sports.io';

export async function getPlayerStats(playerName: string, season: number = 2024) {
  try {
    const response = await fetch(
      `${BASE_URL}/players?search=${encodeURIComponent(playerName)}&season=${season}`,
      {
        headers: {
          'x-apisports-key': FOOTBALL_API_KEY || '',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch player stats');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Football API error:', error);
    return null;
  }
}

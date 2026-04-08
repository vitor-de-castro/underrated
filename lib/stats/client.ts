const API_KEY = process.env.FOOTBALL_API_KEY;
const BASE_URL = 'https://v3.football.api-sports.io';

export async function getPlayerStats(name: string) {
  const response = await fetch(
    `${BASE_URL}/players?search=${encodeURIComponent(name)}&season=2024`,
    {
      headers: {
        'x-rapidapi-key': API_KEY!,
        'x-rapidapi-host': 'v3.football.api-sports.io',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }

  const data = await response.json();
  return data.response[0]; // First match
}

import { NextResponse } from 'next/server';

export async function GET() {
  const mockPlayers = [
    {
      slug: 'cole-palmer',
      displayName: 'Cole Palmer',
      position: 'Midfielder',
      age: 22,
      avatarUrl: 'https://media.api-sports.io/football/players/184935.png',
      club: { name: 'Chelsea' },
      rarity: 'super_rare',
      cards: { nodes: [{ latestEnglishAuction: { currentPrice: '120.00' } }] },
      valueScore: 9.1,
      stats: { goals: 20, assists: 11, minutesPlayed: 2610, gamesPlayed: 29 }
    },
    {
      slug: 'alexander-isak',
      displayName: 'Alexander Isak',
      position: 'Forward',
      age: 24,
      avatarUrl: 'https://media.api-sports.io/football/players/1456.png',
      club: { name: 'Newcastle United' },
      rarity: 'rare',
      cards: { nodes: [{ latestEnglishAuction: { currentPrice: '95.00' } }] },
      valueScore: 8.7,
      stats: { goals: 19, assists: 3, minutesPlayed: 2160, gamesPlayed: 24 }
    },
    {
      slug: 'erling-haaland',
      displayName: 'Erling Haaland',
      position: 'Forward',
      age: 24,
      avatarUrl: 'https://media.api-sports.io/football/players/1100.png',
      club: { name: 'Manchester City' },
      rarity: 'unique',
      cards: { nodes: [{ latestEnglishAuction: { currentPrice: '250.00' } }] },
      valueScore: 8.5,
      stats: { goals: 28, assists: 5, minutesPlayed: 2340, gamesPlayed: 26 }
    },
    {
      slug: 'bukayo-saka',
      displayName: 'Bukayo Saka',
      position: 'Midfielder',
      age: 22,
      avatarUrl: 'https://media.api-sports.io/football/players/18835.png',
      club: { name: 'Arsenal' },
      rarity: 'limited',
      cards: { nodes: [{ latestEnglishAuction: { currentPrice: '180.00' } }] },
      valueScore: 7.8,
      stats: { goals: 12, assists: 18, minutesPlayed: 2520, gamesPlayed: 28 }
    },
    {
      slug: 'martin-odegaard',
      displayName: 'Martin Ødegaard',
      position: 'Midfielder',
      age: 25,
      avatarUrl: 'https://media.api-sports.io/football/players/642.png',
      club: { name: 'Arsenal' },
      rarity: 'rare',
      cards: { nodes: [{ latestEnglishAuction: { currentPrice: '450.00' } }] },
      valueScore: 7.2,
      stats: { goals: 8, assists: 14, minutesPlayed: 2430, gamesPlayed: 27 }
    },
  ];

  return NextResponse.json(mockPlayers.sort((a, b) => b.valueScore - a.valueScore));
}

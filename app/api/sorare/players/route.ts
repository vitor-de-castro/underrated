import { NextResponse } from 'next/server';
import { sorareClient } from '@/lib/sorare/client';
import { GET_PLAYERS } from '@/lib/sorare/queries';
import { getPlayerStats } from '@/lib/stats/client';
import { calculateSorareValue } from '@/lib/algorithms/sorare-value';
import { SorarePlayer, PlayerWithStats } from '@/types/sorare';

export async function GET() {
  try {
    // Fetch players from Sorare
    const data: any = await sorareClient.request(GET_PLAYERS, {
      first: 20, // Start with 20 players
    });

    const players: SorarePlayer[] = data.football.players.nodes;

    // Enrich with stats (first 5 only for testing)
    const enriched: PlayerWithStats[] = await Promise.all(
      players.slice(0, 5).map(async (player) => {
        try {
          // Get stats from API
          const statsData = await getPlayerStats(player.displayName);

          if (statsData && statsData.statistics?.[0]) {
            const mainStats = statsData.statistics[0];

            const stats = {
              goals: mainStats.goals?.total || 0,
              assists: mainStats.goals?.assists || 0,
              minutesPlayed: mainStats.games?.minutes || 0,
              gamesPlayed: mainStats.games?.appearences || 1,
            };

            const playerWithStats: PlayerWithStats = {
              ...player,
              stats,
              valueScore: 0,
            };

            // Calculate value score
            playerWithStats.valueScore = calculateSorareValue(playerWithStats);

            return playerWithStats;
          }
        } catch (error) {
          console.error(`Error fetching stats for ${player.displayName}:`, error);
        }

        // Return player without stats if fetch failed
        return {
          ...player,
          valueScore: 0,
        };
      })
    );

    // Sort by value score
    const sorted = enriched
      .filter(p => p.valueScore > 0)
      .sort((a, b) => b.valueScore - a.valueScore);

    return NextResponse.json(sorted);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { sorareClient } from '@/lib/sorare/client';
import { GET_PLAYERS } from '@/lib/sorare/queries';
import { getPlayerStats } from '@/lib/stats/client';
import { calculateSorareValue } from '@/lib/algorithms/sorare-value';
import { SorarePlayer, PlayerWithStats } from '@/types/sorare';

export async function GET() {
  try {
    console.log('=== Starting API request ===');

    // Test 1: Sorare API
    console.log('Fetching from Sorare...');
    const data: any = await sorareClient.request(GET_PLAYERS, {
      first: 20,
    });
    console.log('Sorare response:', data);

    const players: SorarePlayer[] = data.football.players.nodes;
    console.log(`Found ${players.length} players`);

    // Test 2: Just return Sorare data without stats (for now)
    const simplified = players.slice(0, 5).map(player => ({
      ...player,
      valueScore: 5.0, // Dummy score
      stats: {
        goals: 0,
        assists: 0,
        minutesPlayed: 0,
        gamesPlayed: 0,
      }
    }));

    console.log('Returning players:', simplified);
    return NextResponse.json(simplified);

  } catch (error: any) {
    // Show detailed error
    console.error('=== FULL ERROR ===');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('Full error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch players',
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}

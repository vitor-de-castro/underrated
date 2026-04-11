import { NextResponse } from 'next/server';
import { sorareClient } from '@/lib/sorare/client';
import { GET_PLAYERS } from '@/lib/sorare/queries';

export async function GET() {
  try {
    console.log('=== Fetching from Sorare ===');

    const data = await sorareClient.request<any>(GET_PLAYERS, {
      first: 20,
    });

    console.log('✅ Sorare response received');

    // Extract players from edges structure
    const playerEdges = data.football.players.edges;
    console.log(`Found ${playerEdges.length} players`);

    // Transform to simpler structure
    const players = playerEdges.map((edge: any) => {
      const player = edge.node;

      // Extract first card if exists
      const firstCard = player.cards?.edges?.[0]?.node;
      const cardPrice = firstCard?.latestEnglishAuction?.currentPrice || '0';

      return {
        slug: player.slug,
        displayName: player.displayName,
        position: player.position,
        age: player.age,
        avatarUrl: player.avatarUrl,
        club: player.club,
        cards: {
          nodes: firstCard ? [{
            slug: firstCard.slug,
            rarity: firstCard.rarity,
            serialNumber: firstCard.serialNumber,
            latestEnglishAuction: firstCard.latestEnglishAuction,
          }] : []
        },
        valueScore: 5.0, // Dummy for now
        stats: {
          goals: 0,
          assists: 0,
          minutesPlayed: 0,
          gamesPlayed: 0,
        }
      };
    });

    console.log(`Returning ${players.length} players`);
    return NextResponse.json(players);

  } catch (error) {
    console.error('=== ERROR ===');
    console.error(error);

    return NextResponse.json(
      {
        error: 'Failed to fetch players',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

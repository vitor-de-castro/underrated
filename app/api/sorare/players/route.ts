import { NextResponse } from 'next/server';

const SORARE_GRAPHQL_URL = 'https://api.sorare.com/federation/graphql';

const query = `
  query GetLiveAuctions {
    tokens {
      liveAuctions(last: 7, sport: FOOTBALL) {
        nodes {
          id
          currentPrice
          anyCards {
            slug
            pictureUrl
            rarityTyped
            ... on Card {
              player {
                displayName
                age
                position
                activeClub {
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function GET() {
  try {
    const response = await fetch(SORARE_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    console.log('Sorare response:', JSON.stringify(data, null, 2));

    const auctions = data?.data?.tokens?.liveAuctions?.nodes ?? [];

    const players = auctions
      .filter((auction: any) => {
        const card = auction.anyCards?.[0];
        // Only include cards that have player data (football cards)
        return card?.player?.displayName;
      })
      .map((auction: any) => {
        const card = auction.anyCards[0];
        const player = card.player;
        // Price is in wei (10^18), convert to ETH
        const priceInEth = parseFloat(auction.currentPrice) / 1e18;

        return {
          slug: card.slug,
          displayName: player.displayName,
          position: player.position,
          age: player.age,
          avatarUrl: card.pictureUrl,
          club: { name: player.activeClub?.name || 'Unknown Club' },
          rarity: card.rarityTyped,
          price: priceInEth,
          valueScore: calculateValueScore(priceInEth),
          stats: { goals: 0, assists: 0 }
        };
      });

    return NextResponse.json(players.sort((a: any, b: any) => b.valueScore - a.valueScore));

  } catch (error) {
    console.error('Sorare API error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

function calculateValueScore(priceInEth: number): number {
  // Lower price = potentially more underrated
  // This is a placeholder — you'll want to factor in real stats later
  if (priceInEth === 0) return 0;
  const score = Math.max(0, 10 - priceInEth * 2);
  return Math.min(parseFloat(score.toFixed(1)), 10);
}

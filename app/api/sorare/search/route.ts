import { NextResponse } from 'next/server';

const FEDERATION_URL = 'https://api.sorare.com/federation/graphql';
const SORARE_JWT_TOKEN = process.env.SORARE_JWT_TOKEN;
const SORARE_JWT_AUD = process.env.SORARE_JWT_AUD || 'underrated';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name || name.length < 2) {
    return NextResponse.json([]);
  }

  // Search live auctions AND recent sales for this player
  const query = `
    query SearchPlayer {
      tokens {
        liveAuctions(last: 7, sport: FOOTBALL) {
          nodes {
            currentPrice
            anyCards {
              slug
              pictureUrl
              rarityTyped
              ... on Card {
                player {
                  displayName
                  age
                  anyPositions
                  slug
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

  try {
    const response = await fetch(FEDERATION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SORARE_JWT_TOKEN}`,
        'JWT-AUD': SORARE_JWT_AUD,
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    if (data?.errors) {
      console.log('Errors:', data.errors);
      return NextResponse.json([]);
    }

    const auctions = data?.data?.tokens?.liveAuctions?.nodes ?? [];
    const searchTerm = name.toLowerCase();

    const results = auctions
      .filter((auction: any) => {
        const card = auction.anyCards?.[0];
        const playerName = card?.player?.displayName?.toLowerCase() ?? '';
        const playerSlug = card?.player?.slug?.toLowerCase() ?? '';
        return playerName.includes(searchTerm) || playerSlug.includes(searchTerm);
      })
      .map((auction: any) => {
        const card = auction.anyCards[0];
        const player = card.player;
        const priceInEth = parseFloat(auction.currentPrice ?? '0') / 1e18;
        return {
          slug: card.slug,
          displayName: player?.displayName ?? 'Unknown',
          position: player?.anyPositions?.[0] ?? 'Unknown',
          age: player?.age ?? 0,
          avatarUrl: card.pictureUrl,
          club: { name: player?.activeClub?.name || 'Unknown' },
          rarity: card.rarityTyped,
          price: priceInEth,
          valueScore: calculateValueScore(priceInEth, card.rarityTyped, player?.age ?? 0),
          stats: { goals: 0, assists: 0 },
        };
      });

    console.log(`Found ${results.length} results for "${name}"`);
    return NextResponse.json(results);

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

function calculateValueScore(priceInEth: number, rarity: string, age: number): number {
  if (priceInEth === 0) return 0;
  const rarityBase: Record<string, number> = {
    unique: 9.5, super_rare: 8.5, rare: 7.5, limited: 6.5,
  };
  const base = rarityBase[rarity] ?? 6.0;
  const priceScore = Math.max(0, 1 - priceInEth * 3);
  const ageBonus = age < 23 ? 0.5 : age < 26 ? 0.2 : 0;
  return Math.min(parseFloat((base + priceScore + ageBonus).toFixed(1)), 10);
}

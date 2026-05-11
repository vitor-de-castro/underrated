import { NextResponse } from 'next/server';

const SORARE_GRAPHQL_URL = 'https://api.sorare.com/federation/graphql';
const SORARE_JWT_TOKEN = process.env.SORARE_JWT_TOKEN;
const SORARE_JWT_AUD = process.env.SORARE_JWT_AUD || 'underrated';

// Convert player name to Sorare slug format
// e.g. "Erling Haaland" -> "erling-haaland"
// e.g. "Kylian Mbappé" -> "kylian-mbappe"
function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

async function fetchPlayerBySlug(slug: string) {
  const query = `
    query GetPlayer {
      football {
        player(slug: "${slug}") {
          displayName
          slug
          activeClub { name }
          anyPositions
          age
          anyCards {
            nodes {
              slug
              rarityTyped
              pictureUrl
              latestEnglishAuction {
                currentPrice
                endDate
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(SORARE_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SORARE_JWT_TOKEN}`,
      'JWT-AUD': SORARE_JWT_AUD,
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();
  return data?.data?.football?.player ?? null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Name too short' }, { status: 400 });
    }

    const slug = nameToSlug(name.trim());
    console.log(`Searching for player: "${name}" -> slug: "${slug}"`);

    let player = await fetchPlayerBySlug(slug);

    // If not found, try with just the last name
    if (!player) {
      const parts = slug.split('-');
      if (parts.length > 1) {
        const lastNameSlug = parts[parts.length - 1];
        console.log(`Trying last name only: "${lastNameSlug}"`);
        player = await fetchPlayerBySlug(lastNameSlug);
      }
    }

    if (!player) {
      return NextResponse.json({ player: null, message: `No player found for "${name}". Try their full name or check spelling.` });
    }

    // Filter to non-common cards only and format
    const cards = (player.anyCards?.nodes ?? [])
      .filter((card: any) => card.rarityTyped !== 'common')
      .map((card: any) => ({
        slug: card.slug,
        rarityTyped: card.rarityTyped,
        pictureUrl: card.pictureUrl,
        lastAuctionPrice: card.latestEnglishAuction?.currentPrice
          ? parseFloat(card.latestEnglishAuction.currentPrice) / 1e18
          : null,
        lastAuctionDate: card.latestEnglishAuction?.endDate ?? null,
      }))
      // Sort by rarity
      .sort((a: any, b: any) => {
        const order: Record<string, number> = { unique: 0, super_rare: 1, rare: 2, limited: 3 };
        return (order[a.rarityTyped] ?? 4) - (order[b.rarityTyped] ?? 4);
      });

    return NextResponse.json({
      player: {
        displayName: player.displayName,
        slug: player.slug,
        club: player.activeClub?.name ?? 'Unknown',
        position: player.anyPositions?.[0] ?? 'Unknown',
        age: player.age,
        cards,
      }
    });

  } catch (error) {
    console.error('Player search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

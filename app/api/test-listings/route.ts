import { NextResponse } from 'next/server';

const SORARE_GRAPHQL_URL = 'https://api.sorare.com/federation/graphql';
const SORARE_JWT_TOKEN = process.env.SORARE_JWT_TOKEN;
const SORARE_JWT_AUD = process.env.SORARE_JWT_AUD || 'underrated';

const testQuery = `
  query TestPlayerBySlug {
    football {
      player(slug: "erling-haland") {
        displayName
        slug
        activeClub {
          name
        }
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

export async function GET() {
  try {
    const response = await fetch(SORARE_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SORARE_JWT_TOKEN}`,
        'JWT-AUD': SORARE_JWT_AUD,
      },
      body: JSON.stringify({ query: testQuery }),
    });
    const data = await response.json();
    console.log('Player test:', JSON.stringify(data, null, 2));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

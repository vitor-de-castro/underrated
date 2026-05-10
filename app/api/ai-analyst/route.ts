import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { players } = await request.json();

    if (!players || players.length === 0) {
      return NextResponse.json({ picks: [] });
    }

    // Calculate average price per rarity to include in prompt
    const rarityGroups: Record<string, number[]> = {};
    players.forEach((p: any) => {
      if (!p.rarity || p.price === 0) return;
      if (!rarityGroups[p.rarity]) rarityGroups[p.rarity] = [];
      rarityGroups[p.rarity].push(p.price);
    });
    const avgPrices: Record<string, number> = {};
    Object.entries(rarityGroups).forEach(([rarity, prices]) => {
      avgPrices[rarity] = (prices as number[]).reduce((a, b) => a + b, 0) / (prices as number[]).length;
    });

    const avgPriceContext = Object.entries(avgPrices)
      .map(([rarity, avg]) => `${rarity}: Ξ${(avg as number).toFixed(4)}`)
      .join(', ');

    const playerList = players.map((p: any) => {
      const avg = avgPrices[p.rarity] ?? 0;
      const priceDiff = avg > 0 ? ((p.price - avg) / avg * 100).toFixed(0) : null;
      const priceContext = priceDiff
        ? parseInt(priceDiff) < -10
          ? `${Math.abs(parseInt(priceDiff))}% BELOW average for ${p.rarity}`
          : parseInt(priceDiff) > 10
          ? `${Math.abs(parseInt(priceDiff))}% ABOVE average for ${p.rarity}`
          : 'at average price'
        : 'unknown price context';

      const hoursLeft = p.endTime
        ? Math.max(0, (new Date(p.endTime).getTime() - Date.now()) / (1000 * 60 * 60)).toFixed(1)
        : null;

      return `- ${p.displayName} | ${p.club?.name} | Age: ${p.age} | Position: ${p.position} | Rarity: ${p.rarity} | Price: Ξ${p.price.toFixed(4)} (${priceContext}) | Value Score: ${p.valueScore}/10${hoursLeft ? ` | Auction ends in: ${hoursLeft}h` : ''}`;
    }).join('\n');

    const prompt = `You are an expert Sorare football card analyst. Analyse these ${players.length} live auction cards and identify the TOP 5 most undervalued picks.

Current market averages by rarity: ${avgPriceContext}

For each pick, consider:
1. Age + potential (younger players at top clubs have more upside)
2. Club context (Champions League clubs, title contenders increase card value)
3. Price vs average (cards significantly below average for their rarity are better value)
4. Position scarcity (some positions are harder to find good cards for)
5. Urgency (auctions ending soon that are good value deserve priority mention)

Current live auctions:
${playerList}

Respond ONLY with a JSON array of exactly 5 objects, no markdown, no explanation outside the JSON:
[
  {"name": "Player Name", "reason": "2-3 sentence analysis covering why this card is undervalued, mentioning the price vs average and any urgency if the auction ends soon"},
  ...
]`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content ?? '';
    const clean = content.replace(/```json|```/g, '').trim();
    const picks = JSON.parse(clean);

    return NextResponse.json({ picks });

  } catch (error) {
    console.error('AI analyst error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}

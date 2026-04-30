import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const { players } = await request.json();

    if (!players || players.length === 0) {
      return NextResponse.json({ picks: [] });
    }

    const playerList = players.map((p: any) =>
      `- ${p.displayName} | ${p.club?.name} | Age: ${p.age} | Position: ${p.position} | Rarity: ${p.rarity} | Price: Ξ${p.price.toFixed(4)} | Value Score: ${p.valueScore}/10`
    ).join('\n');

    const prompt = `You are an expert Sorare football card analyst. Analyse these ${players.length} live auction cards and identify the TOP 5 most undervalued picks.

For each pick, consider:
1. Age + potential (younger players at top clubs have more upside)
2. Club context (Champions League clubs, title contenders increase card value)
3. Rarity vs price (is this rarity cheap for this player's profile?)
4. Position scarcity (some positions are harder to find good cards for)
5. Risk assessment (age, club situation, career trajectory)

Current live auctions:
${playerList}

Respond ONLY with a JSON array of exactly 5 objects, no markdown, no explanation outside the JSON:
[
  {"name": "Player Name", "reason": "2-3 sentence analysis covering why this card is undervalued right now"},
  ...
]`;

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ picks: [] });
    }

    const clean = content.text.replace(/```json|```/g, '').trim();
    const picks = JSON.parse(clean);

    return NextResponse.json({ picks });

  } catch (error) {
    console.error('AI analyst error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}

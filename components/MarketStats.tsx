'use client';

import { useMemo } from 'react';

interface Player {
  price: number;
  rarity: string;
  endTime: string | null;
  valueScore: number;
}

interface MarketStatsProps {
  players: Player[];
}

export function MarketStats({ players }: MarketStatsProps) {
  const stats = useMemo(() => {
    if (players.length === 0) return null;

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    const validPrices = players.filter(p => p.price > 0).map(p => p.price);
    const avgPrice = validPrices.length > 0
      ? validPrices.reduce((a, b) => a + b, 0) / validPrices.length
      : 0;
    const cheapest = validPrices.length > 0 ? Math.min(...validPrices) : 0;
    const endingSoon = players.filter(p => {
      if (!p.endTime) return false;
      const diff = new Date(p.endTime).getTime() - now;
      return diff > 0 && diff <= oneHour;
    }).length;

    const rarityCount: Record<string, number> = {};
    players.forEach(p => {
      rarityCount[p.rarity] = (rarityCount[p.rarity] || 0) + 1;
    });
    const mostCommonRarity = Object.entries(rarityCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'limited';

    const avgScore = players.length > 0
      ? players.reduce((a, b) => a + b.valueScore, 0) / players.length
      : 0;

    return { avgPrice, cheapest, endingSoon, mostCommonRarity, avgScore, total: players.length };
  }, [players]);

  if (!stats) return null;

  const statItems = [
    {
      label: 'Cards Loaded',
      value: stats.total.toString(),
      icon: '🃏',
    },
    {
      label: 'Avg Bid Price',
      value: `${String.fromCharCode(926)}${stats.avgPrice.toFixed(4)}`,
      icon: '📊',
    },
    {
      label: 'Cheapest Card',
      value: `${String.fromCharCode(926)}${stats.cheapest.toFixed(4)}`,
      icon: '💰',
      color: '#10b981',
    },
    {
      label: 'Ending Soon',
      value: stats.endingSoon.toString(),
      icon: '⏱',
      color: stats.endingSoon > 0 ? '#ef4444' : '#9ca3af',
    },
    {
      label: 'Avg Value Score',
      value: `${stats.avgScore.toFixed(1)}/10`,
      icon: '⭐',
      color: stats.avgScore >= 7 ? '#10b981' : '#eab308',
    },
    {
      label: 'Most Common',
      value: stats.mostCommonRarity.replace('_', ' '),
      icon: '🏷️',
    },
  ];

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto 24px auto',
      padding: '0 16px',
    }}>
      <div style={{
        background: '#1a1a1a',
        border: '1px solid #374151',
        borderRadius: '16px',
        padding: '20px 24px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '16px',
        }}>
          {statItems.map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
              <div style={{ color: '#a2a2a2', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {item.icon} {item.label}
              </div>
              <div style={{
                color: item.color ?? 'white',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                textTransform: 'capitalize',
              }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

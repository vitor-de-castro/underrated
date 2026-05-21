'use client';

import { useState } from 'react';
import { CountdownTimer } from '@/components/CountdownTimer';

interface FPLData {
  form: string;
  totalPoints: number;
  minutes: number;
  goalsScored: number;
  assists: number;
  expectedGoals: string;
  expectedAssists: string;
  status: string;
  news: string;
}

interface PlayerCardProps {
  name: string;
  club: string;
  position: string;
  age: number;
  price: number;
  valueScore: number;
  goals: number;
  assists: number;
  avatarUrl?: string;
  rarity?: string;
  slug: string;
  endTime?: string | null;
  averagePrice?: number | null;
  fplData?: FPLData | null;
  priceTrend?: 'up' | 'down' | 'stable' | null;
  priceChangePercent?: number | null;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'a': return '#10b981';
    case 'd': return '#f59e0b';
    case 'i': return '#ef4444';
    case 's': return '#ef4444';
    default: return '#6b7280';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'a': return '✅ Available';
    case 'd': return '⚠️ Doubtful';
    case 'i': return '🚑 Injured';
    case 's': return '🟥 Suspended';
    case 'u': return '❌ Unavailable';
    default: return '✅ Available';
  }
}

export function PlayerCard({
  name,
  club,
  position,
  age,
  price,
  valueScore,
  goals,
  assists,
  avatarUrl,
  rarity = 'limited',
  slug,
  endTime,
  averagePrice,
  fplData,
  priceTrend,
  priceChangePercent,
}: PlayerCardProps) {
  const [showFPL, setShowFPL] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 9) return '#10b981';
    if (score >= 8) return '#22c55e';
    if (score >= 7) return '#84cc16';
    if (score >= 6) return '#eab308';
    if (score >= 5) return '#f97316';
    return '#ef4444';
  };

  const getRarityColor = (r: string) => {
    switch (r) {
      case 'unique': return '#fbbf24';
      case 'super_rare': return '#a855f7';
      case 'rare': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getPriceContext = () => {
    if (!averagePrice || averagePrice === 0 || price === 0) return null;
    const diff = ((price - averagePrice) / averagePrice) * 100;
    const absDiff = Math.abs(diff).toFixed(0);
    if (diff <= -10) return { label: `${absDiff}% below average`, color: '#10b981' };
    if (diff >= 10) return { label: `${absDiff}% above average`, color: '#ef4444' };
    return { label: 'Average price', color: '#9ca3af' };
  };

  const getTrendDisplay = () => {
    if (!priceTrend || priceTrend === 'stable' || priceChangePercent === null) return null;
    const abs = Math.abs(priceChangePercent).toFixed(1);
    if (priceTrend === 'up') return { label: `↑ ${abs}%`, color: '#ef4444' }; // price up = more expensive
    if (priceTrend === 'down') return { label: `↓ ${abs}%`, color: '#10b981' }; // price down = cheaper = good
    return null;
  };

  const priceContext = getPriceContext();
  const trendDisplay = getTrendDisplay();

  return (
    <div style={{ maxWidth: '380px', margin: '0 auto', width: '100%' }}>
      <div
        style={{
          background: 'linear-gradient(to bottom, #1f2937, #111827)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          border: '1px solid #374151',
          transition: 'transform 0.2s',
          display: 'flex',
          flexDirection: 'column',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {/* Rarity + badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{
            background: getRarityColor(rarity),
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
          }}>
            {rarity.replace('_', ' ')}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {fplData && (
              <div style={{
                background: 'rgba(99, 102, 241, 0.2)',
                border: '1px solid rgba(99, 102, 241, 0.5)',
                color: '#a5b4fc',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 'bold',
              }}>
                PL
              </div>
            )}
            {valueScore >= 7 && (
              <div style={{
                background: '#ef4444',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 'bold',
              }}>
                HOT
              </div>
            )}
          </div>
        </div>

        {/* Player image */}
        <div style={{
          width: '100%',
          height: '420px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          overflow: 'hidden',
        }}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              style={{ width: '95%', height: '100%', objectFit: 'contain', objectPosition: 'center' }}
            />
          ) : (
            <div style={{ fontSize: '64px', opacity: 0.3 }}>⚽</div>
          )}
        </div>

        {/* Player name */}
        <h3 style={{
          color: 'white',
          fontSize: '20px',
          fontWeight: 'bold',
          marginBottom: '4px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {name}
        </h3>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '16px' }}>
          {club} • {age}y
        </p>

        {/* Countdown Timer */}
        <CountdownTimer endTime={endTime ?? null} />

        {/* Value Score */}
        <div style={{
          background: 'rgba(0,0,0,0.4)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
          border: '1px solid #374151',
        }}>
          <div style={{ color: '#9ca3af', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>
            Value Score
          </div>
          <div style={{ color: getScoreColor(valueScore), fontSize: '36px', fontWeight: '900' }}>
            {valueScore.toFixed(1)}
            <span style={{ fontSize: '18px', color: '#6b7280' }}>/10</span>
          </div>
        </div>

        {/* Price */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
          border: '1px solid rgba(16, 185, 129, 0.3)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ color: '#9ca3af', fontSize: '11px' }}>Current Bid</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {trendDisplay && (
                <div style={{ color: trendDisplay.color, fontSize: '11px', fontWeight: '700' }}>
                  {trendDisplay.label}
                </div>
              )}
              {priceContext && (
                <div style={{ color: priceContext.color, fontSize: '11px', fontWeight: '600' }}>
                  {priceContext.label}
                </div>
              )}
            </div>
          </div>
          <div style={{ color: '#10b981', fontSize: '28px', fontWeight: '900' }}>
            {String.fromCharCode(926)}{price.toFixed(4)}
          </div>
          {averagePrice && averagePrice > 0 && (
            <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '4px' }}>
              Avg for {rarity.replace('_', ' ')}: {String.fromCharCode(926)}{averagePrice.toFixed(4)}
            </div>
          )}
        </div>

        {/* FPL Stats — collapsible */}
        {fplData && showFPL && (
          <div style={{
            background: 'rgba(55, 0, 179, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#a5b4fc', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                ⚽ FPL Stats
              </span>
              <span style={{ color: getStatusColor(fplData.status), fontSize: '11px', fontWeight: '600' }}>
                {getStatusLabel(fplData.status)}
              </span>
            </div>

            {fplData.news && fplData.status !== 'a' && (
              <div style={{
                color: '#f59e0b',
                fontSize: '11px',
                marginBottom: '12px',
                padding: '6px 8px',
                background: 'rgba(245, 158, 11, 0.1)',
                borderRadius: '6px',
              }}>
                {fplData.news}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Form', value: fplData.form, highlight: parseFloat(fplData.form) >= 6 },
                { label: 'xG', value: parseFloat(fplData.expectedGoals).toFixed(1) },
                { label: 'xA', value: parseFloat(fplData.expectedAssists).toFixed(1) },
                { label: 'Goals', value: fplData.goalsScored.toString() },
                { label: 'Assists', value: fplData.assists.toString() },
                { label: 'Minutes', value: fplData.minutes.toString() },
              ].map((stat) => (
                <div key={stat.label} style={{
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '8px',
                  padding: '8px',
                  textAlign: 'center',
                }}>
                  <div style={{ color: '#9ca3af', fontSize: '10px', textTransform: 'uppercase', marginBottom: '2px' }}>
                    {stat.label}
                  </div>
                  <div style={{ color: stat.highlight ? '#10b981' : 'white', fontSize: '1rem', fontWeight: 'bold' }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ color: '#6b7280', fontSize: '10px', textAlign: 'right', marginTop: '8px' }}>
              FPL Season 2025/26
            </div>
          </div>
        )}

        {/* Bottom buttons */}
        {fplData ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <a
              href={'https://sorare.com/football/cards/' + slug}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                background: 'linear-gradient(to right, rgb(39 70 128), rgb(26 41 71))',
                color: 'white',
                fontWeight: 'bold',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '13px',
                textAlign: 'center',
                textDecoration: 'none',
                boxSizing: 'border-box',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'linear-gradient(to right, rgb(49 87 158), rgb(33 52 89))')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'linear-gradient(to right, rgb(39 70 128), rgb(26 41 71))')}
            >
              View on Sorare
            </a>
            <button
              onClick={() => setShowFPL(!showFPL)}
              style={{
                flex: 0,
                whiteSpace: 'nowrap',
                padding: '12px 14px',
                background: showFPL ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.5)',
                borderRadius: '8px',
                color: '#a5b4fc',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {showFPL ? '▲ FPL' : '▼ FPL'}
            </button>
          </div>
        ) : (
          <a
            href={'https://sorare.com/football/cards/' + slug}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              width: '100%',
              background: 'linear-gradient(to right, rgb(39 70 128), rgb(26 41 71))',
              color: 'white',
              fontWeight: 'bold',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              textAlign: 'center',
              textDecoration: 'none',
              boxSizing: 'border-box',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'linear-gradient(to right, rgb(49 87 158), rgb(33 52 89))')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'linear-gradient(to right, rgb(39 70 128), rgb(26 41 71))')}
          >
            View on Sorare
          </a>
        )}
      </div>
    </div>
  );
}

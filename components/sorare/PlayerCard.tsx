'use client';

import { CountdownTimer } from '@/components/CountdownTimer';

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
}: PlayerCardProps) {
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
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {/* Rarity badge */}
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

        {/* Player image */}
        <div style={{
          width: '100%',
          height: '420px',
          background: 'transparent',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          position: 'relative',
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
          <div style={{ color: '#9ca3af', fontSize: '11px', marginBottom: '4px' }}>Current Bid</div>
          <div style={{ color: '#10b981', fontSize: '28px', fontWeight: '900' }}>
            {String.fromCharCode(926)}{price.toFixed(4)}
          </div>
        </div>

        {/* View on Sorare button */}
        <a
          href={'https://sorare.com/football/cards/' + slug}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            width: '100%',
            background: 'linear-gradient(to right, #dc2626, #b91c1c)',
            color: 'white',
            fontWeight: 'bold',
            padding: '12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            textAlign: 'center',
            textDecoration: 'none',
            boxSizing: 'border-box',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'linear-gradient(to right, #ef4444, #dc2626)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'linear-gradient(to right, #dc2626, #b91c1c)')}
        >
          View on Sorare
        </a>
      </div>
    </div>
  );
}

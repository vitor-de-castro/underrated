'use client';

import { useState } from 'react';

interface Player {
  displayName: string;
  club: { name: string };
  age: number;
  rarity: string;
  price: number;
  valueScore: number;
  position: string;
}

interface AIAnalystProps {
  players: Player[];
}

interface Pick {
  name: string;
  reason: string;
}

export function AIAnalyst({ players }: AIAnalystProps) {
  const [picks, setPicks] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysed, setAnalysed] = useState(false);

  async function analyse() {
    setLoading(true);
    setError('');
    setAnalysed(true);

    try {
      const res = await fetch('/api/ai-analyst', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players }),
      });
      const data = await res.json();
      setPicks(data.picks ?? []);
    } catch (err) {
      setError('Failed to analyse. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto 48px auto',
      padding: '0 16px',
    }}>
      <div style={{
        background: 'linear-gradient(to bottom, #1a1a2e, #16213e)',
        border: '1px solid #374151',
        borderRadius: '16px',
        padding: '32px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h2 style={{
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              🤖 AI Market Analyst
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
              Analyses current live auctions and identifies the top 5 undervalued picks
            </p>
          </div>
          <button
            onClick={analyse}
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: loading ? '#374151' : 'linear-gradient(to right, #059669, #047857)',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '10px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.95rem',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? 'Analysing...' : analysed ? 'Re-analyse' : 'Analyse Market'}
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⚙️</div>
            <p>Analysing {players.length} live auctions...</p>
          </div>
        )}

        {error && (
          <div style={{ color: '#ef4444', textAlign: 'center', padding: '20px' }}>
            {error}
          </div>
        )}

        {!loading && picks.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {picks.map((pick, i) => (
              <div key={i} style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid #374151',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
              }}>
                <div style={{
                  background: i === 0 ? '#fbbf24' : i === 1 ? '#9ca3af' : i === 2 ? '#cd7c2f' : '#374151',
                  color: i < 3 ? '#000' : 'white',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', marginBottom: '6px' }}>
                    {pick.name}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: '1.6' }}>
                    {pick.reason}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && analysed && picks.length === 0 && !error && (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>
            No picks available right now.
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { PlayerCard } from '@/components/sorare/PlayerCard';
import { Filters } from '@/components/Filters';

export default function Home() {
  const [players, setPlayers] = useState<any[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedPosition, setSelectedPosition] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [maxPrice, setMaxPrice] = useState(9999);
  const [minValueScore, setMinValueScore] = useState(0);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await fetch('/api/sorare/players');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setPlayers(data);
        setFilteredPlayers(data);
      } catch (err) {
        setError('Failed to load players. Check console for details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlayers();
  }, []);

  useEffect(() => {
    let filtered = [...players];

    if (selectedPosition !== 'all') {
      filtered = filtered.filter(p => p.position === selectedPosition);
    }

    if (selectedRarity !== 'all') {
      filtered = filtered.filter(p => p.rarity === selectedRarity);
    }

    filtered = filtered.filter(p => p.price <= maxPrice);
    filtered = filtered.filter(p => p.valueScore >= minValueScore);

    setFilteredPlayers(filtered);
  }, [selectedPosition, selectedRarity, maxPrice, minValueScore, players]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>⚽</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
            Loading players...
          </div>
          <div style={{ color: '#6b7280' }}>Fetching undervalued gems</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>⚠️</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#ef4444', marginBottom: '8px' }}>
            Error
          </div>
          <div style={{ color: '#9ca3af' }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: '#000000', padding: '48px 16px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{
            fontSize: '4rem',
            fontFamily: "'Russo One', sans-serif",
            fontWeight: '900',
            marginBottom: '16px',
            background: 'linear-gradient(to right, #878787, #c0c0c0, #878787)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.05em',
          }}>
            UNDERRATED
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#9ca3af', marginBottom: '12px' }}>
            Discover undervalued football players on Sorare
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          }}>
            <span style={{
              padding: '4px 12px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              borderRadius: '9999px',
              color: '#f87171',
              fontSize: '0.875rem',
              fontWeight: '600',
            }}>
              Sorare Mode
            </span>
            <span style={{ color: '#4b5563' }}>•</span>
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Real-time market data
            </span>
          </div>
        </div>

        <Filters
          onPositionChange={setSelectedPosition}
          onPriceChange={setMaxPrice}
          onValueScoreChange={setMinValueScore}
          onRarityChange={setSelectedRarity}
        />

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto 24px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ color: '#9ca3af' }}>
            Showing <span style={{ color: 'white', fontWeight: '600' }}>{filteredPlayers.length}</span> player{filteredPlayers.length !== 1 ? 's' : ''}
            {(selectedPosition !== 'all' || selectedRarity !== 'all' || maxPrice !== 9999 || minValueScore !== 0) && (
              <button
                onClick={() => {
                  setSelectedPosition('all');
                  setSelectedRarity('all');
                  setMaxPrice(9999);
                  setMinValueScore(0);
                }}
                style={{
                  marginLeft: '12px',
                  padding: '4px 12px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  borderRadius: '6px',
                  color: '#f87171',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                Clear filters
              </button>
            )}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            Sorted by value score
          </div>
        </div>

        {filteredPlayers.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
            maxWidth: '1400px',
            margin: '0 auto',
          }}>
            {filteredPlayers.map((player) => (
              <PlayerCard
                key={player.slug}
                slug={player.slug}
                name={player.displayName}
                club={player.club?.name || 'Unknown'}
                position={player.position || 'Unknown'}
                age={player.age || 0}
                price={player.price}
                valueScore={player.valueScore}
                goals={player.stats?.goals || 0}
                assists={player.stats?.assists || 0}
                avatarUrl={player.avatarUrl}
                rarity={player.rarity}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '80px 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔍</div>
            <p style={{ fontSize: '1.25rem', color: '#9ca3af' }}>No players match your filters</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '8px' }}>
              Try adjusting the filters above
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

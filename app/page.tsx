'use client';

import { useEffect, useState } from 'react';
import { PlayerCard } from '@/components/sorare/PlayerCard';
import { Filters } from '@/components/Filters';
import { AIAnalyst } from '@/components/AIAnalyst';

export default function Home() {
  const [players, setPlayers] = useState<any[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const [selectedPosition, setSelectedPosition] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [maxPrice, setMaxPrice] = useState(9999);
  const [minValueScore, setMinValueScore] = useState(0);
  const [sortBy, setSortBy] = useState('valueScore');

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await fetch('/api/sorare/players');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setPlayers(data.players);
        setFilteredPlayers(data.players);
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } catch (err) {
        setError('Failed to load players. Check console for details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlayers();
  }, []);

  async function loadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const response = await fetch(`/api/sorare/players?loadMore=true&cursor=${nextCursor}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      const newPlayers = [...players, ...data.players];
      setPlayers(newPlayers);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }

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

    if (sortBy === 'endingSoon') {
      filtered = filtered.sort((a, b) => {
        if (!a.endTime) return 1;
        if (!b.endTime) return -1;
        return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
      });
    } else if (sortBy === 'priceLow') {
      filtered = filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceHigh') {
      filtered = filtered.sort((a, b) => b.price - a.price);
    } else {
      filtered = filtered.sort((a, b) => b.valueScore - a.valueScore);
    }

    setFilteredPlayers(filtered);
  }, [selectedPosition, selectedRarity, maxPrice, minValueScore, sortBy, players]);

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
            fontSize: 'clamp(2rem, 8vw, 4rem)',
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
          <p style={{ fontSize: 'clamp(0.9rem, 3vw, 1.25rem)', color: '#9ca3af', marginBottom: '12px' }}>
            Discover undervalued football players on Sorare
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
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

        <AIAnalyst players={players} />

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
          flexWrap: 'wrap',
          gap: '8px',
        }}>
          <div style={{ color: '#9ca3af', fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>
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
          <select
            onChange={(e) => setSortBy(e.target.value)}
            value={sortBy}
            style={{
              padding: '6px 12px',
              background: '#1a1a1a',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: 'white',
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
          >
            <option value="valueScore">Sort: Value Score</option>
            <option value="endingSoon">Sort: Ending Soonest</option>
            <option value="priceLow">Sort: Price Low to High</option>
            <option value="priceHigh">Sort: Price High to Low</option>
          </select>
        </div>

        {filteredPlayers.length > 0 ? (
          <>
            <div
              className="player-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))',
                gap: '24px',
                maxWidth: '1400px',
                margin: '0 auto',
              }}
            >
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
                  endTime={player.endTime}
                />
              ))}
            </div>

            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  style={{
                    padding: '14px 40px',
                    background: loadingMore ? '#374151' : 'linear-gradient(to right, #1f2937, #374151)',
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    border: '1px solid #374151',
                    cursor: loadingMore ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingMore) e.currentTarget.style.borderColor = '#6b7280';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#374151';
                  }}
                >
                  {loadingMore ? 'Loading...' : 'Load More Cards'}
                </button>
              </div>
            )}
          </>
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

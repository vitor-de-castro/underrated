'use client';

import { useState } from 'react';
import { PlayerCard } from './sorare/PlayerCard';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    if (query.trim().length < 2) return;
    setLoading(true);
    setSearched(true);
    onSearch(query);

    try {
      const res = await fetch(`/api/sorare/search?name=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto 40px auto', padding: '0 16px' }}>
      <div style={{ position: 'relative', display: 'flex', gap: '12px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Search a player by name (e.g. erling haaland)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{
              width: '100%',
              padding: '14px 20px 14px 48px',
              background: '#1a1a1a',
              border: '1px solid #374151',
              borderRadius: '12px',
              color: 'white',
              fontSize: '1rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#ef4444';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#374151';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <div style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '1.25rem',
            color: '#6b7280',
          }}>
            🔍
          </div>
        </div>
        <button
          onClick={handleSearch}
          style={{
            padding: '14px 24px',
            background: 'linear-gradient(to right, #dc2626, #b91c1c)',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            whiteSpace: 'nowrap',
          }}
        >
          Search
        </button>
      </div>

      {/* Search Results */}
      {loading && (
        <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '24px' }}>
          Searching...
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '24px' }}>
          No cards found. Try the exact player name with hyphens (e.g. "erling-haaland")
        </div>
      )}

      {!loading && results.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ color: 'white', marginBottom: '16px', fontSize: '1.2rem' }}>
            Found {results.length} card{results.length !== 1 ? 's' : ''} for {results[0].displayName}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
          }}>
            {results.map((player) => (
              <PlayerCard
                key={player.slug}
                slug={player.slug}
                name={player.displayName}
                club={player.club?.name || 'Unknown'}
                position={player.position || 'Unknown'}
                age={player.age || 0}
                price={player.price}
                valueScore={player.valueScore}
                goals={0}
                assists={0}
                avatarUrl={player.avatarUrl}
                rarity={player.rarity}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

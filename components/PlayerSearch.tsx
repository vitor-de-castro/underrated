'use client';

import { useState } from 'react';

interface Card {
  slug: string;
  rarityTyped: string;
  pictureUrl: string;
  lastAuctionPrice: number | null;
  lastAuctionDate: string | null;
}

interface Player {
  displayName: string;
  slug: string;
  club: string;
  position: string;
  age: number;
  cards: Card[];
}

export function PlayerSearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [player, setPlayer] = useState<Player | null>(null);
  const [message, setMessage] = useState('');
  const [searched, setSearched] = useState(false);

  async function search() {
    if (!query.trim() || query.trim().length < 2) return;
    setLoading(true);
    setPlayer(null);
    setMessage('');
    setSearched(true);

    try {
      const res = await fetch(`/api/sorare/player-search?name=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (data.player) {
        setPlayer(data.player);
      } else {
        setMessage(data.message ?? 'Player not found.');
      }
    } catch (err) {
      setMessage('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const getRarityColor = (r: string) => {
    switch (r) {
      case 'unique': return '#fbbf24';
      case 'super_rare': return '#a855f7';
      case 'rare': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

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
        padding: '24px',
      }}>
        <h2 style={{
          color: 'white',
          fontSize: '1.25rem',
          fontWeight: 'bold',
          marginBottom: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          🔍 Player Search
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '20px' }}>
          Search for any Sorare player to see their cards and last auction prices
        </p>

        {/* Search input */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            placeholder="e.g. Haaland, Mbappé, Vinicius..."
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '12px 16px',
              background: '#000000',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: 'white',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
          <button
            onClick={search}
            disabled={loading || query.trim().length < 2}
            style={{
              padding: '12px 24px',
              background: loading ? '#374151' : 'linear-gradient(to right, rgb(39 70 128), rgb(26 41 71))',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '8px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.95rem',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div style={{ color: '#9ca3af', marginTop: '20px', textAlign: 'center', padding: '20px' }}>
            {message}
          </div>
        )}

        {/* Player result */}
        {player && (
          <div style={{ marginTop: '24px' }}>
            {/* Player header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '20px',
              padding: '16px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '12px',
              border: '1px solid #374151',
              flexWrap: 'wrap',
            }}>
              <div>
                <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '4px' }}>
                  {player.displayName}
                </h3>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                  {player.club} • {player.position} • {player.age}y
                </p>
              </div>
              <a
                href={`https://sorare.com/football/players/${player.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginLeft: 'auto',
                  padding: '8px 16px',
                  background: 'linear-gradient(to right, rgb(39 70 128), rgb(26 41 71))',
                  color: 'white',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                }}
              >
                View on Sorare →
              </a>
            </div>

            {/* Cards */}
            {player.cards.length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center' }}>No non-common cards found for this player.</p>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))',
                gap: '16px',
              }}>
                {player.cards.map((card) => (
                  <a
                    key={card.slug}
                    href={`https://sorare.com/football/cards/${card.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: `1px solid ${getRarityColor(card.rarityTyped)}44`,
                      borderRadius: '12px',
                      padding: '12px',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <img
                        src={card.pictureUrl}
                        alt={card.rarityTyped}
                        style={{ width: '100%', borderRadius: '8px', marginBottom: '8px' }}
                      />
                      <div style={{
                        background: getRarityColor(card.rarityTyped),
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '8px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        display: 'inline-block',
                        marginBottom: '8px',
                      }}>
                        {card.rarityTyped.replace('_', ' ')}
                      </div>
                      {card.lastAuctionPrice ? (
                        <div>
                          <div style={{ color: '#10b981', fontSize: '1rem', fontWeight: 'bold' }}>
                            Ξ{card.lastAuctionPrice.toFixed(4)}
                          </div>
                          <div style={{ color: '#6b7280', fontSize: '11px' }}>
                            Last auction: {formatDate(card.lastAuctionDate!)}
                          </div>
                        </div>
                      ) : (
                        <div style={{ color: '#6b7280', fontSize: '11px' }}>No recent auction</div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

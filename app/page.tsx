'use client';

import { useEffect, useState } from 'react';
import { PlayerCard } from '@/components/sorare/PlayerCard';
import { Filters } from '@/components/Filters';

export default function Home() {
  const [players, setPlayers] = useState<any[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [maxPrice, setMaxPrice] = useState(9999);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await fetch('/api/sorare/players');

        if (!response.ok) {
          throw new Error('Failed to fetch');
        }

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

  // Apply filters whenever they change
  useEffect(() => {
    let filtered = [...players];

    // Filter by position
    if (selectedPosition !== 'all') {
      filtered = filtered.filter(p => p.position === selectedPosition);
    }

    // Filter by price
    const playerPrice = (p: any) => parseFloat(p.cards.nodes[0]?.latestEnglishAuction?.currentPrice || '0');
    filtered = filtered.filter(p => playerPrice(p) <= maxPrice);

    setFilteredPlayers(filtered);
  }, [selectedPosition, maxPrice, players]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">⚽</div>
          <div className="text-2xl font-bold text-white mb-2">Loading players...</div>
          <div className="text-gray-500">Fetching undervalued gems</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-xl font-semibold text-red-500 mb-2">Error</div>
          <div className="text-gray-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
            UNDERRATED
          </h1>
          <p className="text-xl text-gray-400">
            Discover undervalued football players on Sorare
          </p>
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-red-400 text-sm font-semibold">
              Sorare Mode
            </span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-500 text-sm">Real-time market data</span>
          </div>
        </div>

        {/* Filters */}
        <Filters
          onPositionChange={setSelectedPosition}
          onPriceChange={setMaxPrice}
        />

        {/* Results count */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-gray-400">
            Showing <span className="text-white font-semibold">{filteredPlayers.length}</span> player{filteredPlayers.length !== 1 ? 's' : ''}
          </div>
          <div className="text-xs text-gray-500">
            Sorted by value score
          </div>
        </div>

        {/* Player grid */}
        {filteredPlayers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlayers.map((player) => (
              <PlayerCard
                key={player.slug}
                name={player.displayName}
                club={player.club.name}
                position={player.position}
                age={player.age}
                price={parseFloat(player.cards.nodes[0]?.latestEnglishAuction?.currentPrice || '0')}
                valueScore={player.valueScore}
                goals={player.stats?.goals || 0}
                assists={player.stats?.assists || 0}
                avatarUrl={player.avatarUrl}
                rarity={player.rarity}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-400">No players match your filters</p>
            <p className="text-sm text-gray-600 mt-2">Try adjusting the filters above</p>
          </div>
        )}
      </div>
    </main>
  );
}

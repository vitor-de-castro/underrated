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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚽</div>
          <div className="text-xl font-semibold">Loading players...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <div className="text-xl font-semibold mb-2">Error</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-3">Underrated</h1>
          <p className="text-xl text-gray-600">
            Discover undervalued football players on Sorare
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Sorare Mode • Powered by real-time data
          </p>
        </div>

        {/* Filters */}
        <Filters
          onPositionChange={setSelectedPosition}
          onPriceChange={setMaxPrice}
        />

        {/* Results count */}
        <div className="mb-4 text-gray-600">
          Showing {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''}
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
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            <p className="text-xl">No players match your filters</p>
            <p className="text-sm mt-2">Try adjusting the filters above</p>
          </div>
        )}
      </div>
    </main>
  );
}

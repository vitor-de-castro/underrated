'use client';

import { useEffect, useState } from 'react';
import { PlayerCard } from '@/components/sorare/PlayerCard';

export default function Home() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await fetch('/api/sorare/players');

        if (!response.ok) {
          throw new Error('Failed to fetch');
        }

        const data = await response.json();
        setPlayers(data);
      } catch (err) {
        setError('Failed to load players. Check console for details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPlayers();
  }, []);

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

        {/* Player grid */}
        {players.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {players.map((player) => (
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
          <div className="text-center text-gray-500">
            <p>No players found</p>
          </div>
        )}
      </div>
    </main>
  );
}

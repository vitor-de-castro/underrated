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
}: PlayerCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-red-500';
    if (score >= 5) return 'text-orange-500';
    if (score >= 3) return 'text-yellow-500';
    return 'text-gray-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
      {/* Value badge */}
      {valueScore >= 6 && (
        <div className="bg-red-500 text-white text-xs px-3 py-1 rounded-full inline-block mb-3">
          🔥 UNDERVALUED
        </div>
      )}

      {/* Player image */}
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt={name}
          className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
        />
      )}

      {/* Player info */}
      <h3 className="text-xl font-bold text-center mb-1">{name}</h3>
      <p className="text-gray-600 text-sm text-center mb-4">
        {club} • {position} • {age}y
      </p>

      {/* Value score */}
      <div className="text-center mb-4">
        <div className="text-sm text-gray-500 mb-1">Value Score</div>
        <div className={`text-4xl font-bold ${getScoreColor(valueScore)}`}>
          {valueScore.toFixed(1)}/10
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-center">
        <div className="bg-gray-50 rounded p-3">
          <div className="text-gray-500 text-xs mb-1">Goals</div>
          <div className="text-lg font-bold">⚽ {goals}</div>
        </div>
        <div className="bg-gray-50 rounded p-3">
          <div className="text-gray-500 text-xs mb-1">Assists</div>
          <div className="text-lg font-bold">🎯 {assists}</div>
        </div>
      </div>

      {/* Price */}
      <div className="border-t pt-4 text-center">
        <div className="text-gray-500 text-xs mb-1">Sorare Floor Price</div>
        <div className="text-2xl font-bold text-green-600">
          €{price.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

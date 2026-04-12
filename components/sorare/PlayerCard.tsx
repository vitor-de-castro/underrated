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
}: PlayerCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-red-500';
    if (score >= 7) return 'text-orange-500';
    if (score >= 6) return 'text-yellow-500';
    return 'text-gray-400';
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'unique': return 'from-yellow-600 to-yellow-800';
      case 'super_rare': return 'from-purple-600 to-purple-800';
      case 'rare': return 'from-blue-600 to-blue-800';
      case 'limited': return 'from-gray-600 to-gray-800';
      default: return 'from-gray-600 to-gray-800';
    }
  };

  return (
    <div className="group relative">
      {/* Sorare card design */}
      <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-2xl hover:shadow-red-500/20 transition-all duration-300 hover:scale-105">

        {/* Card border gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(rarity)} opacity-20`}></div>

        {/* Rarity indicator */}
        <div className="absolute top-3 right-3 z-10">
          <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase bg-gradient-to-r ${getRarityColor(rarity)} text-white shadow-lg`}>
            {rarity}
          </div>
        </div>

        {/* Value badge */}
        {valueScore >= 7 && (
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
              🔥 HOT
            </div>
          </div>
        )}

        {/* Card content */}
        <div className="relative p-6">

          {/* Player image placeholder */}
          <div className="relative mb-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-full h-48 object-cover object-top rounded-lg"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-6xl opacity-50">⚽</div>
              </div>
            )}

            {/* Position badge on image */}
            <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white">
              {position}
            </div>
          </div>

          {/* Player info */}
          <div className="space-y-3">
            <div>
              <h3 className="text-xl font-bold text-white truncate">{name}</h3>
              <p className="text-sm text-gray-400">{club} • {age}y</p>
            </div>

            {/* Value Score - Big and prominent */}
            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Value Score</div>
              <div className={`text-4xl font-black ${getScoreColor(valueScore)}`}>
                {valueScore.toFixed(1)}
                <span className="text-lg text-gray-500">/10</span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-gray-700">
                <div className="text-xs text-gray-400 mb-1">Goals</div>
                <div className="text-2xl font-bold text-green-400">⚽ {goals}</div>
              </div>
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-gray-700">
                <div className="text-xs text-gray-400 mb-1">Assists</div>
                <div className="text-2xl font-bold text-blue-400">🎯 {assists}</div>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 backdrop-blur-sm rounded-lg p-4 border border-green-700/50">
              <div className="text-xs text-gray-300 uppercase tracking-wider mb-1">Floor Price</div>
              <div className="text-3xl font-black text-green-400">
                €{price.toFixed(2)}
              </div>
            </div>

            {/* Action button */}
            <button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-red-500/50">
              View Details
            </button>
          </div>
        </div>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
    </div>
  );
}

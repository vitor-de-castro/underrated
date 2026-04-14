'use client';

interface FiltersProps {
  onPositionChange: (position: string) => void;
  onPriceChange: (maxPrice: number) => void;
}

export function Filters({ onPositionChange, onPriceChange }: FiltersProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-6 mb-8">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <span>🎯</span>
        Filters
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Position filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
            Position
          </label>
          <select
            onChange={(e) => onPositionChange(e.target.value)}
            className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          >
            <option value="all">All Positions</option>
            <option value="Forward">⚡ Forward</option>
            <option value="Midfielder">🎯 Midfielder</option>
            <option value="Defender">🛡️ Defender</option>
            <option value="Goalkeeper">🧤 Goalkeeper</option>
          </select>
        </div>

        {/* Price filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
            Max Price
          </label>
          <select
            onChange={(e) => onPriceChange(Number(e.target.value))}
            className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          >
            <option value="9999">Any Price</option>
            <option value="100">💰 Under €100</option>
            <option value="200">💵 Under €200</option>
            <option value="300">💸 Under €300</option>
            <option value="500">💎 Under €500</option>
          </select>
        </div>

        {/* Value score filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
            Min Value Score
          </label>
          <select
            className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          >
            <option value="0">All Scores</option>
            <option value="7">⭐ 7.0+</option>
            <option value="8">⭐⭐ 8.0+</option>
            <option value="9">⭐⭐⭐ 9.0+</option>
          </select>
        </div>
      </div>
    </div>
  );
}

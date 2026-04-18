'use client';

interface FiltersProps {
  onPositionChange: (position: string) => void;
  onPriceChange: (maxPrice: number) => void;
}

export function Filters({ onPositionChange, onPriceChange }: FiltersProps) {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto 32px auto',
      padding: '0 16px',
    }}>
      <div style={{
        background: '#1a1a1a',
        border: '1px solid #374151',
        borderRadius: '16px',
        padding: '24px',
      }}>
        <h3 style={{
          color: 'white',
          fontSize: '1.125rem',
          fontWeight: 'bold',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>🎯</span>
          Filters
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}>
          {/* Position filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#9ca3af',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Position
            </label>
            <select
              onChange={(e) => onPositionChange(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#000000',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
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
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#9ca3af',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Max Price
            </label>
            <select
              onChange={(e) => onPriceChange(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '12px',
                background: '#000000',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
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
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#9ca3af',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Min Value Score
            </label>
            <select
              style={{
                width: '100%',
                padding: '12px',
                background: '#000000',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              <option value="0">All Scores</option>
              <option value="7">⭐ 7.0+</option>
              <option value="8">⭐⭐ 8.0+</option>
              <option value="9">⭐⭐⭐ 9.0+</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

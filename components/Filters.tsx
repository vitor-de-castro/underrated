'use client';

interface FiltersProps {
  onPositionChange: (position: string) => void;
  onPriceChange: (maxPrice: number) => void;
  onValueScoreChange: (minScore: number) => void;
  onRarityChange: (rarity: string) => void;
}

export function Filters({ onPositionChange, onPriceChange, onValueScoreChange, onRarityChange }: FiltersProps) {
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

        <div
          className="filters-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))',
            gap: '16px',
          }}
        >
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
              <option value="Forward">Forward</option>
              <option value="Midfielder">Midfielder</option>
              <option value="Defender">Defender</option>
              <option value="Goalkeeper">Goalkeeper</option>
            </select>
          </div>

          {/* Rarity filter */}
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
              Rarity
            </label>
            <select
              onChange={(e) => onRarityChange(e.target.value)}
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
              <option value="all">All Rarities</option>
              <option value="limited">Limited</option>
              <option value="rare">Rare</option>
              <option value="super_rare">Super Rare</option>
              <option value="unique">Unique</option>
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
              Max Price (ETH)
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
              <option value="0.001">Under 0.001 ETH</option>
              <option value="0.003">Under 0.003 ETH</option>
              <option value="0.005">Under 0.005 ETH</option>
              <option value="0.01">Under 0.01 ETH</option>
              <option value="0.05">Under 0.05 ETH</option>
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
              onChange={(e) => onValueScoreChange(Number(e.target.value))}
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
              <option value="7">7.0+</option>
              <option value="8">8.0+</option>
              <option value="9">9.0+</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

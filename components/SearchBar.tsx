'use client';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto 24px auto',
      padding: '0 16px', // Match the main container padding
    }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Search players by name..."
          onChange={(e) => onSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '14px 20px 14px 48px',
            background: '#1a1a1a',
            border: '1px solid #374151',
            borderRadius: '12px',
            color: 'white',
            fontSize: '1rem',
            outline: 'none',
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
    </div>
  );
}

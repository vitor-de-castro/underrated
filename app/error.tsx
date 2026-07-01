'use client'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace',
      color: '#ffffff',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚽</div>
      <h1 style={{ fontSize: '2rem', color: '#BDBDBD', marginBottom: '0.5rem' }}>Something went wrong</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>The market data couldn't be loaded.</p>
      <button
        onClick={reset}
        style={{
          color: '#BDBDBD',
          border: '1px solid #BDBDBD',
          padding: '0.8rem 1.5rem',
          background: 'transparent',
          cursor: 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontSize: '0.85rem',
          fontFamily: 'monospace'
        }}
      >
        Try Again →
      </button>
    </div>
  )
}

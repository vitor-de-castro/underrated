export default function NotFound() {
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
      <h1 style={{ fontSize: '2rem', color: '#BDBDBD', marginBottom: '0.5rem' }}>404</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>This page is offside.</p>
      <a href="/" style={{
        color: '#BDBDBD',
        border: '1px solid #BDBDBD',
        padding: '0.8rem 1.5rem',
        textDecoration: 'none',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        fontSize: '0.85rem'
      }}>
        Back to Market →
      </a>
    </div>
  )
}

'use client';

interface FPLData {
  form: string;
  totalPoints: number;
  minutes: number;
  goalsScored: number;
  assists: number;
  expectedGoals: string;
  expectedAssists: string;
  status: string;
  news: string;
}

interface FPLStatsProps {
  fplData: FPLData;
}

function getStatusLabel(status: string): { label: string; color: string } {
  switch (status) {
    case 'a': return { label: '✅ Available', color: '#10b981' };
    case 'd': return { label: '⚠️ Doubtful', color: '#f59e0b' };
    case 'i': return { label: '🚑 Injured', color: '#ef4444' };
    case 's': return { label: '🟥 Suspended', color: '#ef4444' };
    case 'u': return { label: '❌ Unavailable', color: '#6b7280' };
    default: return { label: '✅ Available', color: '#10b981' };
  }
}

export function FPLStats({ fplData }: FPLStatsProps) {
  const statusInfo = getStatusLabel(fplData.status);

  return (
    <div style={{
      background: 'rgba(55, 0, 179, 0.1)',
      border: '1px solid rgba(99, 102, 241, 0.3)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span style={{ fontSize: '16px' }}>⚽</span>
          <span style={{
            color: '#a5b4fc',
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            FPL Stats
          </span>
        </div>
        <span style={{
          color: statusInfo.color,
          fontSize: '11px',
          fontWeight: '600',
        }}>
          {statusInfo.label}
        </span>
      </div>

      {/* Injury news */}
      {fplData.news && fplData.status !== 'a' && (
        <div style={{
          color: '#f59e0b',
          fontSize: '11px',
          marginBottom: '12px',
          padding: '6px 8px',
          background: 'rgba(245, 158, 11, 0.1)',
          borderRadius: '6px',
        }}>
          {fplData.news}
        </div>
      )}

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '8px',
      }}>
        <StatBox label="Form" value={fplData.form} highlight={parseFloat(fplData.form) >= 6} />
        <StatBox label="xG" value={parseFloat(fplData.expectedGoals).toFixed(1)} />
        <StatBox label="xA" value={parseFloat(fplData.expectedAssists).toFixed(1)} />
        <StatBox label="Goals" value={fplData.goalsScored.toString()} />
        <StatBox label="Assists" value={fplData.assists.toString()} />
        <StatBox label="Minutes" value={fplData.minutes.toString()} />
      </div>

      <div style={{
        marginTop: '8px',
        color: '#6b7280',
        fontSize: '10px',
        textAlign: 'right',
      }}>
        FPL Season 2024/25
      </div>
    </div>
  );
}

function StatBox({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{
      background: 'rgba(0,0,0,0.3)',
      borderRadius: '8px',
      padding: '8px',
      textAlign: 'center',
    }}>
      <div style={{
        color: '#9ca3af',
        fontSize: '10px',
        textTransform: 'uppercase',
        marginBottom: '2px',
      }}>
        {label}
      </div>
      <div style={{
        color: highlight ? '#10b981' : 'white',
        fontSize: '1rem',
        fontWeight: 'bold',
      }}>
        {value}
      </div>
    </div>
  );
}

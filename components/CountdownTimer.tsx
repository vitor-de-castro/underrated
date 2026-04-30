'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  endTime: string | null;
}

export function CountdownTimer({ endTime }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    if (!endTime) return;

    function update() {
      const now = Date.now();
      const end = new Date(endTime!).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Ended');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setUrgent(diff < 60 * 60 * 1000); // urgent if less than 1 hour

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (!endTime || !timeLeft) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      background: urgent ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0,0,0,0.4)',
      border: `1px solid ${urgent ? 'rgba(239, 68, 68, 0.5)' : '#374151'}`,
      borderRadius: '8px',
      marginBottom: '16px',
    }}>
      <span style={{ fontSize: '14px' }}>⏱</span>
      <span style={{
        color: urgent ? '#ef4444' : '#9ca3af',
        fontSize: '13px',
        fontWeight: urgent ? 'bold' : 'normal',
      }}>
        {timeLeft === 'Ended' ? 'Auction ended' : `Ends in ${timeLeft}`}
      </span>
    </div>
  );
}

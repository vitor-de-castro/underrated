'use client';

import { useState } from 'react';

export function HowItWorks() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ? button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid #374151',
          color: '#9ca3af',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#6b7280';
          e.currentTarget.style.color = 'white';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#374151';
          e.currentTarget.style.color = '#9ca3af';
        }}
        aria-label="How it works"
      >
        ?
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1a1a1a',
              border: '1px solid #374151',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '540px',
              width: '100%',
              position: 'relative',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: '#9ca3af',
                fontSize: '20px',
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              ✕
            </button>

            <h2 style={{
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '8px',
            }}>
              How Underrated works
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '24px' }}>
              Underrated helps you find undervalued football cards on Sorare before others do.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                {
                  title: 'Live Auction Data',
                  desc: 'We fetch 60 live Sorare auctions in real time using the authenticated Sorare GraphQL API. Cards are sorted by value score so the best deals appear first.',
                },
                {
                  title: 'Value Score',
                  desc: 'Each card gets a score from 0 to 10 based on how cheap it is compared to the average price for that rarity. Age and scarcity add bonus points. For Premier League players, injury status and current form also affect the score.',
                },
                {
                  title: 'Price Trends',
                  desc: "We store hourly price snapshots in Redis and show whether a card's price has moved up or down in the last 24 hours — data you won't find on Sorare itself.",
                },
                {
                  title: 'FPL Stats',
                  desc: 'Premier League cards show live FPL data — form, xG, xA, injury status — so you know whether the player behind the card is actually worth buying right now.',
                },
                {
                  title: 'AI Market Analyst',
                  desc: 'Click "Analyse Market" to get AI-powered picks. The analyst considers price context, auction urgency, and player data to identify the top 5 undervalued cards in the current market.',
                },
              ].map((item) => (
                <div key={item.title} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ color: 'white', fontWeight: '600', marginBottom: '4px' }}>
                    {item.title}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: '1.6' }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid #374151',
              color: '#6b7280',
              fontSize: '0.8rem',
              textAlign: 'center',
            }}>
              New to Sorare? Visit{' '}
              <a
                href="https://sorare.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#a5b4fc', textDecoration: 'none' }}
              >
                sorare.com
              </a>
              {' '}to learn more about the platform.
            </div>
          </div>
        </div>
      )}
    </>
  );
}

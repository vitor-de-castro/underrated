# UNDERRATED 🎯

**Real-time Sorare football card analytics platform for discovering undervalued cards in live auctions.**

🌐 Live at [underrated.live](https://underrated.live)

---

## What it does

Underrated connects to the Sorare live auction market in real time and helps users identify which football cards are undervalued based on price context, rarity, player age, and for Premier League players, live FPL performance data. Instead of manually browsing Sorare, users get an instant overview of the market with filters, sorting, AI-powered analysis, price trend tracking, and multi-currency support.

---

## Features

### 🔴 Live Auction Data
- Fetches 60 live auctions in real time via the Sorare GraphQL API
- Load more button to browse additional cards
- Refresh button with "last updated X minutes ago" timestamp
- 1-hour intelligent caching to avoid API rate limits

### ⏱ Auction Countdown Timers
- Live countdown on every card showing time remaining
- Urgent red styling for auctions ending within 1 hour

### 💰 Price Context & Multi-Currency
- Calculates the average price per rarity from all loaded cards
- Shows each card as X% above or below average for its rarity
- Currency toggle — switch between ETH, USD and EUR instantly
- Live ETH/USD/EUR rates fetched from CoinGecko (cached 10 minutes)

### 📈 Price Trend Tracking
- Stores hourly price snapshots in Upstash Redis
- Shows "↑ Price up X% (24h)" or "↓ Price down X% (24h)" on each card
- Up to 24 hours of price history per card

### 📊 Market Stats Bar
- Cards loaded, average bid price, cheapest card, ending soon count
- Average value score, most common rarity
- Price trending up/down counts
- Grid layout on desktop, horizontal scroll on mobile

### 🤖 AI Market Analyst
- Powered by OpenAI GPT-4o-mini
- Analyses all live auctions with full price context and auction urgency
- Identifies top 5 undervalued picks with detailed reasoning
- TRENDING badge and direct "View on Sorare" link for each pick

### 🏴󠁧󠁢󠁥󠁮󠁧󠁿 FPL Integration (Premier League players)
- Form, xG, xA, goals, assists, minutes — collapsible per card
- Injury and availability status with news
- FPL data influences the value score:
  - Injured/unavailable → -1.0
  - Suspended → -0.7
  - Doubtful → -0.5
  - Form 8+ → +0.5
  - Form 6+ → +0.3
  - Form below 2 → -0.2

### 🎯 Filters
- Filter by league (Premier League, La Liga, Bundesliga, Serie A, Ligue 1, Other European, MLS, Other Leagues, All European)
- Filter by nationality — dynamic top 10 most common nationalities from loaded cards
- Filter by position, rarity, max price, minimum value score
- Collapsible filter panel — clean on mobile
- Clear all filters button

### 🔃 Sort Options
- Sort by value score (default), ending soonest, price low/high

### ❓ How It Works Modal
- Discrete `?` button in the header
- Explains value score, price trends, FPL stats and AI analyst to new users

---

## Tech Stack

- **Framework:** Next.js 16 + TypeScript
- **UI:** React
- **APIs:** Sorare GraphQL (authenticated JWT), OpenAI (GPT-4o-mini), FPL, CoinGecko
- **Database:** Upstash Redis (price trend snapshots)
- **Deployment:** Vercel
- **Domain:** underrated.live

---

## Architecture

```
app/
  page.tsx                          — Main page with filters, sorting, currency toggle
  api/
    sorare/
      players/route.ts              — Fetches live auctions, calculates value scores, FPL matching, ETH rates
    ai-analyst/route.ts             — OpenAI market analysis endpoint
components/
  sorare/
    PlayerCard.tsx                  — Card with countdown, price context, FPL stats, currency display
  AIAnalyst.tsx                     — AI analyst UI with picks, HOT badge and Sorare links
  Filters.tsx                       — Collapsible filter panel
  MarketStats.tsx                   — Market stats bar
  CountdownTimer.tsx                — Live countdown timer
  BackToTop.tsx                     — Fixed back to top button
  HowItWorks.tsx                    — How it works modal
lib/
  fpl-service.ts                    — FPL data fetching and caching (24h)
  price-trend-service.ts            — Upstash Redis price snapshot storage and trend calculation
  eth-price-service.ts              — CoinGecko ETH/USD/EUR rates (cached 10 minutes)
```

---

## Value Score Algorithm

The value score (0-10) measures how undervalued a card is:

- **Price context (dominant)** — ratio of current price to rarity average. 50%+ below average → 8.5, at average → 5.5, 100%+ above average → 1.5
- **Age bonus** — under 21 → +0.5, under 24 → +0.3, under 27 → +0.1
- **Rarity bonus (tiebreaker)** — Unique +0.5, Super Rare +0.3, Rare +0.1, Limited +0
- **FPL bonus/penalty (PL players only)** — based on injury status and current form

---

## JWT Token Renewal

The Sorare JWT token expires monthly. A renewal script is included:

```bash
node renew-token.js
```

Required environment variables in `.env.local`:
```
SORARE_JWT_TOKEN=
SORARE_JWT_AUD=underrated
SORARE_EMAIL=
SORARE_PASSWORD=
VERCEL_TOKEN=
VERCEL_PROJECT_ID=
OPENAI_API_KEY=
FOOTBALL_DATA_API_KEY=
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

---

## Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

---

Built by [Vitor de Castro](https://vitor-de-castro.github.io)

# UNDERRATED 

**Real-time Sorare football card analytics platform for discovering undervalued cards in live auctions.**

🌐 Live at [underrated.live](https://underrated.live)

---

## What it does

Underrated connects to the Sorare live auction market in real time and helps users identify which football cards are undervalued based on price context, rarity, and auction urgency. Instead of manually browsing Sorare, users get an instant overview of the market with filters, sorting, and AI-powered analysis.

---

## Features

### 🔴 Live Auction Data
- Fetches 30 live auctions in real time via the Sorare GraphQL API
- Load more button to browse additional cards
- Refresh button with "last updated X minutes ago" timestamp
- 1-hour intelligent caching to avoid API rate limits

### ⏱ Auction Countdown Timers
- Live countdown on every card showing time remaining
- Urgent red styling for auctions ending within 1 hour

### 💰 Price Context
- Calculates the average price per rarity from all loaded cards
- Shows each card as X% above or below average for its rarity
- Value score factors in price vs average — cheaper than average scores higher

### 📊 Market Stats Bar
- Cards loaded, average bid price, cheapest card, ending soon count
- Average value score across all cards
- Most common rarity in current auctions
- Horizontally scrollable on mobile

### 🤖 AI Market Analyst
- Powered by OpenAI GPT-4o-mini
- Analyses all live auctions with full price context and auction urgency
- Identifies top 5 undervalued picks with detailed reasoning
- Considers age, club context, rarity vs price, position scarcity, and time remaining

### 🎯 Filters
- Filter by league (Premier League, La Liga, Bundesliga, Serie A, Ligue 1, MLS, All European)
- Filter by position (Forward, Midfielder, Defender, Goalkeeper)
- Filter by rarity (Limited, Rare, Super Rare, Unique)
- Filter by max price (ETH)
- Filter by minimum value score
- Clear all filters button

### 🔃 Sort Options
- Sort by value score (default)
- Sort by ending soonest
- Sort by price low to high
- Sort by price high to low

---

## Tech Stack

- **Framework:** Next.js 16 + TypeScript
- **UI:** React, Tailwind CSS
- **API:** Sorare GraphQL API (authenticated JWT)
- **AI:** OpenAI API (GPT-4o-mini)
- **Deployment:** Vercel
- **Domain:** Namecheap → underrated.live

---

## Architecture

```
app/
  page.tsx                    — Main page with filters, sorting, load more
  api/
    sorare/
      players/route.ts        — Fetches live auctions, calculates value scores
    ai-analyst/route.ts       — OpenAI market analysis endpoint
components/
  sorare/
    PlayerCard.tsx            — Individual card with countdown, price context
  AIAnalyst.tsx               — AI analyst UI with picks
  Filters.tsx                 — All filter dropdowns including league
  MarketStats.tsx             — Market stats bar
  CountdownTimer.tsx          — Live countdown timer
```

---

## Value Score

The value score (0-10) is calculated per card based on:

- **Rarity base score** — Unique (9.5), Super Rare (8.5), Rare (7.5), Limited (6.5)
- **Price context** — Cards priced 50%+ below rarity average get +1.5, overpriced cards get up to -1.5
- **Age bonus** — Under 23 gets +0.5, under 26 gets +0.2

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
```

The script fetches a new token from Sorare, updates Vercel environment variables automatically, and updates `.env.local`.

---

## Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

---

Built by [Vitor de Castro](https://vitor-de-castro.github.io)

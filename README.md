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

The value score (0-10) measures how undervalued a card is based on:

- **Price context (dominant factor)** — how the current bid compares to the average price for that rarity across all loaded cards. A card 50%+ below average scores 8.5, a card at average scores 5.5, an overpriced card scores 1.5
- **Age bonus** — under 21 gets +0.5, under 24 gets +0.3, under 27 gets +0.1. Younger players have more upside
- **Rarity bonus (tiebreaker)** — Unique +0.5, Super Rare +0.3, Rare +0.1, Limited +0. Scarcity within the same price context adds marginal value

A 10/10 requires a card to be significantly below average price, young, and scarce. An average-priced card scores around 5.5.

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

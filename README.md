# SMC Sniper Signals 🎯

A real-time, full-stack trading dashboard that leverages **Smart Money Concepts (SMC)** to detect market structure shifts and generate high-probability trading signals. Built with Next.js, WebSockets, and TradingView Lightweight Charts.

## ✨ Features

- **Real-Time Market Data**: Streams live tick data for major forex pairs and commodities (EUR/USD, GBP/USD, USD/JPY, XAU/USD) using the Deriv WebSocket API.
- **Live Candlestick Charts**: High-performance, interactive charting powered by TradingView's `lightweight-charts`.
- **Automated SMC Engine**: Continuously analyzes price action to identify:
  - Swing Highs and Swing Lows
  - Break of Structure (BOS)
  - Change of Character (CHoCH)
  - Order Blocks and Liquidity Zones
- **Live Signal Feed**: Automatically generates actionable trading signals complete with:
  - Entry Price
  - Stop Loss (SL)
  - Multiple Take Profit (TP) targets
  - Confidence Scoring
- **Admin Control Panel**: A dedicated interface to monitor system health, adjust strategy parameters (like swing lookback periods and risk/reward ratios), and manage database connections.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS v4, Framer Motion, Lucide Icons
- **Backend**: Custom Node.js Server (Express) with native WebSockets (`ws`)
- **Charting**: `lightweight-charts`
- **Market Data**: Deriv API
- **Database**: Supabase (Configurable for persisting historical signals)

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables by copying the example file:
   ```bash
   cp .env.example .env.local
   ```
   *(Optional)* Add your Supabase credentials to `.env.local` if you wish to persist signals.

3. Start the development server:
   ```bash
   npm run dev
   ```
   > **Note**: This project uses a custom server (`server.ts`) to handle both the Next.js frontend and the WebSocket backend simultaneously.

4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the dashboard.

## 📁 Project Structure

```text
├── app/                  # Next.js App Router pages and layouts
│   ├── admin/            # Admin control panel
│   ├── globals.css       # Global Tailwind CSS styles
│   └── page.tsx          # Main trading dashboard
├── components/           # Reusable React components
│   ├── SignalFeed.tsx    # Live feed of generated SMC signals
│   └── TradingChart.tsx  # TradingView lightweight chart wrapper
├── hooks/                # Custom React hooks
│   └── useMarketData.ts  # Manages WebSocket connection and state
├── lib/                  # Core business logic
│   └── smc.ts            # Smart Money Concepts detection engine
├── server.ts             # Custom Express & WebSocket server
└── package.json          # Project dependencies and scripts
```

## ⚙️ Configuration

The SMC Engine can be fine-tuned via the Admin Panel (`/admin`) or by modifying the parameters in `lib/smc.ts`:
- **Swing Lookback**: Number of candles required to confirm a swing high/low.
- **Risk/Reward Ratio**: Determines the placement of Take Profit targets relative to the Stop Loss.

## ⚠️ Disclaimer

This software is for educational and informational purposes only. It does not constitute financial advice. Trading forex and cryptocurrencies involves significant risk of loss and is not suitable for all investors. Always do your own research and consult with a qualified financial advisor before making any investment decisions.

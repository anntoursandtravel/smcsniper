'use client';

import { useState } from 'react';
import { useMarketData } from '@/hooks/useMarketData';
import TradingChart from '@/components/TradingChart';
import SignalFeed from '@/components/SignalFeed';
import { Activity, BarChart2, Crosshair, Settings, ShieldAlert, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

const SYMBOLS = ['frxEURUSD', 'frxGBPUSD', 'frxUSDJPY', 'frxXAUUSD'];
const SYMBOL_NAMES: Record<string, string> = {
  'frxEURUSD': 'EUR/USD',
  'frxGBPUSD': 'GBP/USD',
  'frxUSDJPY': 'USD/JPY',
  'frxXAUUSD': 'XAU/USD (Gold)'
};

export default function Dashboard() {
  const { candles, signals, connected } = useMarketData();
  const [selectedSymbol, setSelectedSymbol] = useState(SYMBOLS[0]);

  const currentPrice = candles[selectedSymbol]?.[candles[selectedSymbol]?.length - 1]?.close || 0;
  const prevPrice = candles[selectedSymbol]?.[candles[selectedSymbol]?.length - 2]?.close || currentPrice;
  const priceChange = currentPrice - prevPrice;
  const isPositive = priceChange >= 0;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Top Navigation */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <Crosshair className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="font-mono font-bold tracking-tight text-lg">SMC SNIPER</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              {connected ? 'LIVE' : 'DISCONNECTED'}
            </div>
            <Link href="/admin" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Settings className="w-5 h-5 text-zinc-400" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-5">
            <div className="text-sm text-zinc-500 font-medium mb-1 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Active Signals
            </div>
            <div className="text-3xl font-mono font-light">{signals.length}</div>
          </div>
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-5">
            <div className="text-sm text-zinc-500 font-medium mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Win Rate (Est)
            </div>
            <div className="text-3xl font-mono font-light text-emerald-400">84.2%</div>
          </div>
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-5">
            <div className="text-sm text-zinc-500 font-medium mb-1 flex items-center gap-2">
              <BarChart2 className="w-4 h-4" /> Markets Tracked
            </div>
            <div className="text-3xl font-mono font-light">4</div>
          </div>
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-5">
            <div className="text-sm text-zinc-500 font-medium mb-1 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Risk Level
            </div>
            <div className="text-3xl font-mono font-light text-amber-400">MODERATE</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Area */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Symbol Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {SYMBOLS.map(sym => (
                <button
                  key={sym}
                  onClick={() => setSelectedSymbol(sym)}
                  className={`px-4 py-2 rounded-xl font-mono text-sm whitespace-nowrap transition-all ${
                    selectedSymbol === sym 
                      ? 'bg-white text-black font-semibold shadow-lg shadow-white/10' 
                      : 'bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 border border-white/5'
                  }`}
                >
                  {SYMBOL_NAMES[sym]}
                </button>
              ))}
            </div>

            {/* Chart Container */}
            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-1 h-[500px] relative flex flex-col">
              <div className="absolute top-4 right-4 z-10 flex flex-col items-end">
                <div className={`text-2xl font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {currentPrice > 0 ? currentPrice.toFixed(5) : '---'}
                </div>
                <div className={`text-sm font-mono ${isPositive ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
                  {isPositive ? '+' : ''}{priceChange.toFixed(5)}
                </div>
              </div>
              <TradingChart data={candles[selectedSymbol] || []} symbol={SYMBOL_NAMES[selectedSymbol]} />
            </div>
          </div>

          {/* Sidebar Feed */}
          <div className="flex flex-col h-[560px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-mono font-semibold text-lg flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-emerald-500" /> Live Signals
              </h3>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md font-mono border border-emerald-500/20">
                AUTO-REFRESH
              </span>
            </div>
            <div className="flex-1 bg-zinc-900/30 border border-white/5 rounded-2xl p-2 overflow-hidden">
              <SignalFeed signals={signals} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

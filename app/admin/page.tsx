'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Activity, Database, Play, Settings, ShieldAlert, StopCircle, ArrowLeft } from 'lucide-react';

export default function AdminPanel() {
  const [isRunning, setIsRunning] = useState(true);
  const [lookback, setLookback] = useState(5);
  const [riskReward, setRiskReward] = useState(3);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 font-sans p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors text-sm font-mono">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-mono font-bold flex items-center gap-3">
              <Settings className="w-6 h-6 text-emerald-500" />
              Admin Control Panel
            </h1>
            <p className="text-zinc-500 mt-1">Manage SMC Sniper Engine parameters and system status.</p>
          </div>
          <button 
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold transition-all ${
              isRunning 
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30' 
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
            }`}
          >
            {isRunning ? <StopCircle className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isRunning ? 'STOP ENGINE' : 'START ENGINE'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Engine Status */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-mono font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-zinc-400" /> System Status
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg border border-white/5">
                <span className="text-zinc-400">WebSocket Connection</span>
                <span className="text-emerald-400 font-mono">CONNECTED</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg border border-white/5">
                <span className="text-zinc-400">Data Stream (Deriv)</span>
                <span className="text-emerald-400 font-mono">ACTIVE (4 pairs)</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg border border-white/5">
                <span className="text-zinc-400">Database (Supabase)</span>
                <span className="text-amber-400 font-mono">PENDING SETUP</span>
              </div>
            </div>
          </div>

          {/* Strategy Parameters */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-mono font-semibold mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-zinc-400" /> Strategy Parameters
            </h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-zinc-400">Swing Lookback Period</label>
                  <span className="font-mono text-emerald-400">{lookback} candles</span>
                </div>
                <input 
                  type="range" 
                  min="3" 
                  max="15" 
                  value={lookback}
                  onChange={(e) => setLookback(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-zinc-400">Target Risk/Reward</label>
                  <span className="font-mono text-emerald-400">1:{riskReward}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={riskReward}
                  onChange={(e) => setRiskReward(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-mono text-sm transition-colors">
                SAVE PARAMETERS
              </button>
            </div>
          </div>

          {/* Database Management */}
          <div className="md:col-span-2 bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-mono font-semibold mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-zinc-400" /> Database Management
            </h2>
            <p className="text-zinc-500 text-sm mb-4">
              To persist signals and historical data, connect your Supabase project by adding the credentials to the environment variables.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">NEXT_PUBLIC_SUPABASE_URL</div>
                <div className="font-mono text-sm truncate opacity-50">Not configured</div>
              </div>
              <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</div>
                <div className="font-mono text-sm truncate opacity-50">Not configured</div>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-mono hover:bg-emerald-500/30 transition-colors">
                TEST CONNECTION
              </button>
              <button className="px-4 py-2 bg-white/5 text-zinc-300 border border-white/10 rounded-lg text-sm font-mono hover:bg-white/10 transition-colors">
                CLEAR HISTORY
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

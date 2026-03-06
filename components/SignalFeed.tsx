'use client';

import { Signal } from '@/lib/smc';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight, Target, ShieldAlert, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface SignalFeedProps {
  signals: Signal[];
}

export default function SignalFeed({ signals }: SignalFeedProps) {
  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto pr-2 custom-scrollbar">
      {signals.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-zinc-500 py-10">
          <Clock className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm">Waiting for signals...</p>
        </div>
      ) : (
        signals.slice().reverse().map((signal, idx) => (
          <motion.div
            key={signal.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 hover:bg-zinc-800/50 transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md ${signal.direction === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {signal.direction === 'BUY' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="font-mono font-semibold text-zinc-100">{signal.asset}</h4>
                  <p className="text-xs text-zinc-500">{format(new Date(signal.timestamp), 'HH:mm:ss')}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-zinc-400">Confidence</div>
                <div className="text-sm font-mono text-zinc-100">{signal.confidenceScore}%</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1 flex items-center gap-1">
                  <Target className="w-3 h-3" /> Entry
                </div>
                <div className="font-mono text-sm text-zinc-200">{signal.entryPrice.toFixed(5)}</div>
              </div>
              <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Stop Loss
                </div>
                <div className="font-mono text-sm text-rose-400">{signal.stopLoss.toFixed(5)}</div>
              </div>
            </div>

            <div className="flex gap-2">
              {[signal.takeProfit1, signal.takeProfit2, signal.takeProfit3].map((tp, i) => (
                <div key={i} className="flex-1 bg-emerald-500/10 rounded-lg p-2 border border-emerald-500/20 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-emerald-500/70 mb-1">TP {i + 1}</div>
                  <div className="font-mono text-xs text-emerald-400">{tp.toFixed(5)}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-3 pt-3 border-t border-white/5 text-xs text-zinc-400 italic">
              {signal.reason}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}

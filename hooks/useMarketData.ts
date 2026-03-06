'use client';

import { useEffect, useState } from 'react';
import { Candle, Signal } from '@/lib/smc';

export function useMarketData() {
  const [candles, setCandles] = useState<Record<string, Candle[]>>({});
  const [signals, setSignals] = useState<Signal[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Determine WS URL based on current window location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Connected to local WS server');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'INIT_SIGNALS') {
          setSignals(message.data);
        } else if (message.type === 'SIGNAL') {
          setSignals(prev => [...prev, message.data]);
        } else if (message.type === 'TICK') {
          const { symbol, price, time } = message.data;
          
          setCandles(prev => {
            const currentSymbolCandles = prev[symbol] || [];
            const minuteTime = Math.floor(time / 5000) * 5000;
            
            const newCandles = [...currentSymbolCandles];
            
            if (newCandles.length === 0 || newCandles[newCandles.length - 1].time !== minuteTime) {
              newCandles.push({
                time: minuteTime,
                open: price,
                high: price,
                low: price,
                close: price
              });
            } else {
              const last = newCandles[newCandles.length - 1];
              last.high = Math.max(last.high, price);
              last.low = Math.min(last.low, price);
              last.close = price;
            }
            
            // Keep last 100 candles
            if (newCandles.length > 100) {
              newCandles.shift();
            }
            
            return { ...prev, [symbol]: newCandles };
          });
        }
      } catch (e) {
        console.error('Error parsing WS message', e);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from local WS server');
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  return { candles, signals, connected };
}

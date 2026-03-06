import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer, WebSocket } from 'ws';
import { SMCEngine, Candle, Signal } from './lib/smc';
import { supabase } from './lib/supabase';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Deriv WebSocket API
const DERIV_APP_ID = process.env.NEXT_PUBLIC_DERIV_APP_ID || '1089';
const DERIV_WS_URL = `wss://ws.binaryws.com/websockets/v3?app_id=${DERIV_APP_ID}`;

const symbols = ['frxEURUSD', 'frxGBPUSD', 'frxUSDJPY', 'frxXAUUSD'];
const engines: Record<string, SMCEngine> = {};
const currentCandles: Record<string, Candle> = {};
const signals: Signal[] = [
  {
    id: 'mock-1',
    asset: 'frxXAUUSD',
    direction: 'BUY',
    entryPrice: 2045.50,
    stopLoss: 2040.00,
    takeProfit1: 2050.00,
    takeProfit2: 2055.00,
    takeProfit3: 2060.00,
    timestamp: Date.now() - 60000,
    confidenceScore: 92,
    reason: 'Bullish BOS detected with displacement from 15m order block.'
  },
  {
    id: 'mock-2',
    asset: 'frxEURUSD',
    direction: 'SELL',
    entryPrice: 1.0850,
    stopLoss: 1.0870,
    takeProfit1: 1.0820,
    takeProfit2: 1.0800,
    takeProfit3: 1.0780,
    timestamp: Date.now() - 300000,
    confidenceScore: 88,
    reason: 'Bearish CHoCH after sweeping buyside liquidity.'
  }
];

symbols.forEach(sym => {
  engines[sym] = new SMCEngine();
});

function connectDeriv() {
  const derivWs = new WebSocket(DERIV_WS_URL);

  derivWs.on('open', () => {
    console.log('Connected to Deriv WebSocket');
    symbols.forEach(symbol => {
      derivWs.send(JSON.stringify({
        ticks: symbol,
        subscribe: 1
      }));
    });
  });

  derivWs.on('message', (data) => {
    try {
      const response = JSON.parse(data.toString());
      if (response.msg_type === 'tick') {
        const tick = response.tick;
        const symbol = tick.symbol;
        const price = tick.quote;
        const time = tick.epoch * 1000; // ms

        // Aggregate into 5s candles for faster testing
        const minuteTime = Math.floor(time / 5000) * 5000;

        if (!currentCandles[symbol] || currentCandles[symbol].time !== minuteTime) {
          if (currentCandles[symbol]) {
            const closedCandle = { ...currentCandles[symbol] };
            engines[symbol].addCandle(closedCandle);
            const signal = engines[symbol].checkForSignals(symbol);

            // Persist market data to DB asynchronously
            supabase.from('market_data').insert([
              {
                symbol,
                time: closedCandle.time,
                open: closedCandle.open,
                high: closedCandle.high,
                low: closedCandle.low,
                close: closedCandle.close
              }
            ]).then(({ error }) => {
              if (error) {
                if (error.code !== '23505') { // Ignore unique violation on (symbol, time)
                  console.error('Error saving market data to DB', error.message);
                }
              }
            });
            if (signal) {
              signals.push(signal);
              // Async insert to DB
              supabase.from('signals').insert([signal]).then(({ error }) => {
                if (error) console.error('Error saving signal to DB', error);
              });
              broadcast({ type: 'SIGNAL', data: signal });
            }
          }
          currentCandles[symbol] = {
            time: minuteTime,
            open: price,
            high: price,
            low: price,
            close: price
          };
        } else {
          currentCandles[symbol].high = Math.max(currentCandles[symbol].high, price);
          currentCandles[symbol].low = Math.min(currentCandles[symbol].low, price);
          currentCandles[symbol].close = price;
        }

        // Broadcast tick to clients
        broadcast({ type: 'TICK', data: { symbol, price, time } });
        // console.log(`Tick: ${symbol} ${price}`);
      }
    } catch (e) {
      console.error('Error parsing Deriv message', e);
    }
  });

  derivWs.on('close', () => {
    console.log('Deriv WebSocket closed, reconnecting...');
    setTimeout(connectDeriv, 5000);
  });

  derivWs.on('error', (err) => {
    console.error('Deriv WebSocket error', err);
  });
}

const clients = new Set<WebSocket>();

function broadcast(message: any) {
  const data = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    clients.add(ws);
    
    // Send initial state
    ws.send(JSON.stringify({ type: 'INIT_SIGNALS', data: signals }));
    
    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    connectDeriv();
  });
});

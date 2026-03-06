const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

// Replace the connectDeriv function
const oldConnectDeriv = `function connectDeriv() {
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
        // console.log(\`Tick: \${symbol} \${price}\`);
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
}`;

const newConnectDeriv = `
// Store historical candles per symbol
const historicalCandles = {};

function connectDeriv() {
  const derivWs = new WebSocket(DERIV_WS_URL);

  derivWs.on('open', () => {
    console.log('Connected to Deriv WebSocket');
    symbols.forEach(symbol => {
      // First fetch history
      derivWs.send(JSON.stringify({
        ticks_history: symbol,
        end: 'latest',
        style: 'ticks',
        count: 5000 // Enough ticks to build 100 5-sec candles
      }));
      // Then subscribe to live ticks
      derivWs.send(JSON.stringify({
        ticks: symbol,
        subscribe: 1
      }));
    });
  });

  derivWs.on('message', (data) => {
    try {
      const response = JSON.parse(data.toString());

      if (response.msg_type === 'history') {
        const symbol = response.echo_req.ticks_history;
        const prices = response.history.prices;
        const times = response.history.times;

        const candles = [];
        let currentCandle = null;

        for (let i = 0; i < prices.length; i++) {
          const price = prices[i];
          const time = times[i] * 1000;
          const minuteTime = Math.floor(time / 5000) * 5000;

          if (!currentCandle || currentCandle.time !== minuteTime) {
            if (currentCandle) {
              candles.push(currentCandle);
            }
            currentCandle = {
              time: minuteTime,
              open: price,
              high: price,
              low: price,
              close: price
            };
          } else {
            currentCandle.high = Math.max(currentCandle.high, price);
            currentCandle.low = Math.min(currentCandle.low, price);
            currentCandle.close = price;
          }
        }

        if (currentCandle) {
          candles.push(currentCandle);
        }

        // Take the last 100 candles
        const recentCandles = candles.slice(-100);
        historicalCandles[symbol] = recentCandles;

        // Feed historical candles to SMCEngine
        recentCandles.forEach(c => {
           engines[symbol].addCandle(c);
        });

        // Broadcast history to clients
        broadcast({ type: 'HISTORY', data: { symbol, candles: recentCandles } });
      } else if (response.msg_type === 'tick') {
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
        // console.log(\`Tick: \${symbol} \${price}\`);
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
`;

serverCode = serverCode.replace(oldConnectDeriv, newConnectDeriv);
fs.writeFileSync('server.ts', serverCode);

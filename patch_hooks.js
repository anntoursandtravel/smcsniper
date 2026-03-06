const fs = require('fs');

let code = fs.readFileSync('hooks/useMarketData.ts', 'utf8');

const oldSwitch = `        if (message.type === 'INIT_SIGNALS') {
          setSignals(message.data);
        } else if (message.type === 'SIGNAL') {
          setSignals(prev => [...prev, message.data]);
        } else if (message.type === 'TICK') {`;

const newSwitch = `        if (message.type === 'INIT_SIGNALS') {
          setSignals(message.data);
        } else if (message.type === 'SIGNAL') {
          setSignals(prev => [...prev, message.data]);
        } else if (message.type === 'HISTORY') {
          const { symbol, candles } = message.data;
          setCandles(prev => ({
            ...prev,
            [symbol]: candles
          }));
        } else if (message.type === 'TICK') {`;

code = code.replace(oldSwitch, newSwitch);
fs.writeFileSync('hooks/useMarketData.ts', code);

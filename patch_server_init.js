const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// We also need to send the history when a client first connects,
// because if they refresh the page, they won't trigger the Deriv "history" callback again.

const oldConn = `  wss.on('connection', (ws) => {
    clients.add(ws);

    // Send initial state
    ws.send(JSON.stringify({ type: 'INIT_SIGNALS', data: signals }));

    ws.on('close', () => {
      clients.delete(ws);
    });
  });`;

const newConn = `  wss.on('connection', (ws) => {
    clients.add(ws);

    // Send initial state
    ws.send(JSON.stringify({ type: 'INIT_SIGNALS', data: signals }));

    // Send cached history to newly connected client
    symbols.forEach(symbol => {
      if (historicalCandles[symbol]) {
         ws.send(JSON.stringify({ type: 'HISTORY', data: { symbol, candles: historicalCandles[symbol] } }));
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
    });
  });`;

code = code.replace(oldConn, newConn);
fs.writeFileSync('server.ts', code);

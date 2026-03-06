const WebSocket = require('./node_modules/ws');
const ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');

ws.on('open', () => {
  ws.send(JSON.stringify({
    ticks_history: 'frxEURUSD',
    end: 'latest',
    style: 'ticks',
    count: 2000
  }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  if (msg.error) {
     console.error("Error:", msg.error.message);
  }
  if (msg.msg_type === 'history') {
    console.log("History length:", msg.history.prices.length);
    console.log("First:", msg.history.times[0], msg.history.prices[0]);
    console.log("Last:", msg.history.times[msg.history.times.length-1], msg.history.prices[msg.history.prices.length-1]);
    process.exit(0);
  }
});

setTimeout(() => { console.log("Timeout"); process.exit(1); }, 10000);
